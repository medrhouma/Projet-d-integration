import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Configuration Firebase (pour les push notifications)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export interface NotificationPayload {
  id_etudiant: number;
  type: 'CHANGEMENT_EMPLOI_TEMPS' | 'ANNULATION_COURS' | 'ABSENCE_ENREGISTREE' | 'NOTE_PUBLIEE' | 'MESSAGE_ENSEIGNANT' | 'RAPPEL_DEVOIR' | 'ALERTE_PRESENCE' | 'INFORMATION_GENERALE';
  titre: string;
  message: string;
  donnees?: Record<string, any>;
  canaux?: ('EMAIL' | 'PUSH' | 'IN_APP')[];
}

export class NotificationService {
  // Envoyer une notification complète
  static async envoyer(payload: NotificationPayload) {
    try {
      console.log('📢 Envoi de notification:', payload);

      // Récupérer les préférences de l'étudiant
      const preferences = await prisma.preferenceNotification.findUnique({
        where: { id_etudiant: payload.id_etudiant },
      });

      // Récupérer les données de l'étudiant
      const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant: payload.id_etudiant },
        include: { utilisateur: true },
      });

      if (!etudiant?.utilisateur) {
        console.error('Étudiant non trouvé');
        return;
      }

      // Créer l'enregistrement de notification
      const notification = await prisma.notification.create({
        data: {
          id_etudiant: payload.id_etudiant,
          type: payload.type,
          titre: payload.titre,
          message: payload.message,
          donnees_json: payload.donnees ? JSON.stringify(payload.donnees) : null,
        },
      });

      const canaux = payload.canaux || ['EMAIL', 'PUSH', 'IN_APP'];

      // Vérifier les heures tranquilles
      const heure_actuelle = new Date().getHours();
      const en_heures_tranquilles =
        preferences?.heure_debut_tranquille &&
        preferences?.heure_fin_tranquille &&
        heure_actuelle >= preferences.heure_debut_tranquille &&
        heure_actuelle < preferences.heure_fin_tranquille;

      // Envoyer par email
      if (
        canaux.includes('EMAIL') &&
        preferences?.activer_email &&
        !en_heures_tranquilles
      ) {
        await this.envoyerEmail(etudiant, notification);
      }

      // Envoyer push notification
      if (
        canaux.includes('PUSH') &&
        preferences?.activer_push &&
        !en_heures_tranquilles
      ) {
        await this.envoyerPush(payload.id_etudiant, notification);
      }

      return notification;
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      throw error;
    }
  }

  // Envoyer par email
  private static async envoyerEmail(etudiant: any, notification: any) {
    try {
      const template = this.genererTemplateEmail(notification);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@school.tn',
        to: etudiant.utilisateur.email,
        subject: `📬 ${notification.titre}`,
        html: template,
      });

      // Marquer comme envoyé
      await prisma.notification.update({
        where: { id_notification: notification.id_notification },
        data: {
          email_envoye: true,
          date_envoi_email: new Date(),
        },
      });

      console.log('✅ Email envoyé à:', etudiant.utilisateur.email);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
    }
  }

  // Envoyer notification push
  private static async envoyerPush(id_etudiant: number, notification: any) {
    try {
      // Récupérer les tokens de l'étudiant
      const tokens = await prisma.pushToken.findMany({
        where: {
          id_etudiant,
          actif: true,
        },
      });

      if (tokens.length === 0) {
        console.log('Aucun token push pour cet étudiant');
        return;
      }

      const message = {
        notification: {
          title: notification.titre,
          body: notification.message,
        },
        data: {
          type: notification.type,
          id_notification: notification.id_notification.toString(),
        },
      };

      // Envoyer à tous les appareils
      const results = await admin.messaging().sendMulticast({
        tokens: tokens.map((t) => t.token),
        ...message,
      });

      console.log('✅ Push envoyée:', results.successCount, 'succès');

      // Marquer comme envoyé
      await prisma.notification.update({
        where: { id_notification: notification.id_notification },
        data: {
          push_envoye: true,
          date_envoi_push: new Date(),
        },
      });

      // Nettoyer les tokens invalides
      const failedTokens = results.responses
        .map((resp, idx) => (resp.error ? tokens[idx].id_token : null))
        .filter((id) => id !== null);

      if (failedTokens.length > 0) {
        await prisma.pushToken.deleteMany({
          where: { id_token: { in: failedTokens as number[] } },
        });
      }
    } catch (error) {
      console.error('❌ Erreur envoi push:', error);
    }
  }

  // Générer le template HTML pour l'email
  private static genererTemplateEmail(notification: any): string {
    const types_emojis: Record<string, string> = {
      CHANGEMENT_EMPLOI_TEMPS: '📅',
      ANNULATION_COURS: '❌',
      ABSENCE_ENREGISTREE: '⚠️',
      NOTE_PUBLIEE: '📊',
      MESSAGE_ENSEIGNANT: '💬',
      RAPPEL_DEVOIR: '📝',
      ALERTE_PRESENCE: '🔔',
      INFORMATION_GENERALE: 'ℹ️',
    };

    const emoji = types_emojis[notification.type] || '📢';

    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.titre}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">
              ${emoji} ${notification.titre}
            </h1>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p style="margin-top: 0;">${notification.message}</p>
            
            <!-- Données spécifiques -->
            ${
              notification.donnees_json
                ? this.genererDonnees(JSON.parse(notification.donnees_json))
                : ''
            }

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard-etudiant" 
                 style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Voir plus de détails
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>Vous recevez ce message car vous êtes inscrit à l'école.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard-etudiant/preferences" 
                 style="color: #3b82f6; text-decoration: none;">
                Gérer vos préférences de notification
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Générer les détails des données
  private static genererDonnees(donnees: Record<string, any>): string {
    let html = '<div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">';

    if (donnees.matiere) {
      html += `<p><strong>Matière:</strong> ${donnees.matiere}</p>`;
    }
    if (donnees.salle) {
      html += `<p><strong>Salle:</strong> ${donnees.salle}</p>`;
    }
    if (donnees.heure) {
      html += `<p><strong>Heure:</strong> ${donnees.heure}</p>`;
    }
    if (donnees.date) {
      html += `<p><strong>Date:</strong> ${donnees.date}</p>`;
    }
    if (donnees.raison) {
      html += `<p><strong>Raison:</strong> ${donnees.raison}</p>`;
    }

    html += '</div>';
    return html;
  }

  // Récupérer les notifications non lues
  static async obtenirNonLues(id_etudiant: number) {
    return await prisma.notification.findMany({
      where: {
        id_etudiant,
        in_app_lu: false,
      },
      orderBy: {
        date_creation: 'desc',
      },
    });
  }

  // Marquer comme lue
  static async marquerCommeLue(id_notification: number) {
    return await prisma.notification.update({
      where: { id_notification },
      data: {
        in_app_lu: true,
        date_lecture_app: new Date(),
      },
    });
  }

  // Enregistrer un token push
  static async enregistrerPushToken(
    id_etudiant: number,
    token: string,
    device_type: string
  ) {
    // Vérifier si le token existe déjà
    const existant = await prisma.pushToken.findUnique({
      where: { token },
    });

    if (existant) {
      return await prisma.pushToken.update({
        where: { token },
        data: {
          actif: true,
          date_derniere_util: new Date(),
        },
      });
    }

    return await prisma.pushToken.create({
      data: {
        id_etudiant,
        token,
        device_type,
      },
    });
  }

  // Obtenir les préférences
  static async obtenirPreferences(id_etudiant: number) {
    let pref = await prisma.preferenceNotification.findUnique({
      where: { id_etudiant },
    });

    // Créer les préférences par défaut si elles n'existent pas
    if (!pref) {
      pref = await prisma.preferenceNotification.create({
        data: { id_etudiant },
      });
    }

    return pref;
  }

  // Mettre à jour les préférences
  static async mettreAJourPreferences(
    id_etudiant: number,
    donnees: Record<string, any>
  ) {
    return await prisma.preferenceNotification.upsert({
      where: { id_etudiant },
      update: donnees,
      create: {
        id_etudiant,
        ...donnees,
      },
    });
  }
}