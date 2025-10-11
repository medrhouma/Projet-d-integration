import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// Mock data temporaire avec toutes les informations
const mockDepartementsComplets = [
  {
    id_departement: 1,
    nom: 'Technologies de l\'Informatique',
    code: 'INFO',
    description: 'Département des technologies de l\'informatique',
    presentation: 'Le département Technologies de l\'Informatique a été créé en Septembre 2007. Il assure la formation en licence appliquée en technologies de l\'informatique.',
    parcours: [
      'Réseaux & services informatiques (RSI)',
      'Multimédia & développement web (MDW)',
      'Développement des systèmes d\'information (DSI)'
    ],
    laboratoires: [
      '07 laboratoires d\'informatique',
      '01 laboratoire CISCO',
      '01 laboratoire C2i',
      '01 salle de projets'
    ],
    debouches: [
      'Développeur d\'Applications de gestion',
      'Développeur de sites Web',
      'Développeur Multimédia',
      'Développeur de bases de données',
      'Technico-commercial dans la mise en place de solutions logicielles',
      'Webmaster développeur',
      'Webmaster designer',
      'Administrateur de portail web',
      'Intégrateur de technologies web',
      'Administrateur réseaux',
      'Administrateur systèmes',
      'Architecte réseaux et systèmes de communication'
    ],
    equipe: {
      total: 21,
      composition: [
        '02 maîtres technologues en informatique',
        '01 maître technologue en gestion',
        '09 technologues en informatique',
        '03 assistants technologues en informatique',
        '04 professeurs de l\'enseignement supérieur en informatique',
        '03 professeurs de l\'enseignement supérieur en mathématiques, français et anglais'
      ]
    },
    plan_etude: 'Plan d\'étude disponible sur demande',
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation (RSI, MDW et DSI)',
      '01 semestre de stage de fin de parcours',
      'Les étudiants réaliseront 2 stages d\'initiation et de perfectionnement durant respectivement la 1ère et la 2ème année'
    ],
    manifestations: 'Plusieurs manifestations sont organisées chaque année universitaire au profit des enseignants et des étudiants. Des visites industrielles, des sorties et des participations aux manifestations régionales et nationales sont aussi programmées chaque année.'
  },
  {
    id_departement: 2,
    nom: 'Génie Civil',
    code: 'GC',
    description: 'Département de génie civil',
    presentation: 'Le département de Génie Civil forme des techniciens supérieurs dans les domaines du bâtiment, des travaux publics et de la topographie.',
    parcours: [
      'Bâtiment',
      'Travaux Publics',
      'Topographie'
    ],
    laboratoires: [
      '05 laboratoires de génie civil',
      '01 laboratoire de topographie',
      '01 salle de dessin technique'
    ],
    debouches: [
      'Conducteur de travaux',
      'Technicien en bureau d\'études',
      'Géomètre-topographe',
      'Chef de chantier',
      'Métreur-vérificateur',
      'Dessinateur en bâtiment'
    ],
    equipe: {
      total: 18,
      composition: [
        '02 maîtres technologues en génie civil',
        '08 technologues en génie civil',
        '03 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation (Bâtiment, Travaux Publics, Topographie)',
      '01 semestre de stage de fin d\'études',
      'Stages pratiques sur chantiers'
    ]
  },
  {
    id_departement: 3,
    nom: 'Génie Électrique',
    code: 'GE',
    description: 'Département de génie électrique',
    presentation: 'Le département de Génie Électrique forme des techniciens supérieurs spécialisés en automatisme industriel, électronique et systèmes électriques.',
    parcours: [
      'Automatisme Industriel',
      'Électronique & Instrumentation',
      'Systèmes Électriques'
    ],
    laboratoires: [
      '06 laboratoires d\'électronique',
      '02 laboratoires d\'automatisme',
      '01 laboratoire de systèmes électriques',
      '01 atelier d\'instrumentation'
    ],
    debouches: [
      'Technicien en automatisme',
      'Technicien en électronique industrielle',
      'Technicien en maintenance électrique',
      'Technicien en instrumentation',
      'Superviseur de systèmes automatisés',
      'Technicien en énergies renouvelables'
    ],
    equipe: {
      total: 19,
      composition: [
        '02 maîtres technologues en génie électrique',
        '09 technologues en génie électrique',
        '03 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation',
      '01 semestre de stage de fin d\'études',
      'Projets industriels en partenariat avec des entreprises'
    ]
  },
  {
    id_departement: 4,
    nom: 'Génie Mécanique',
    code: 'GM',
    description: 'Département de Génie Mécanique',
    presentation: 'Le département de Génie Mécanique assure la formation de techniciens supérieurs en conception mécanique, maintenance industrielle et production mécanique.',
    parcours: [
      'Conception Mécanique',
      'Maintenance Industrielle',
      'Production Mécanique'
    ],
    laboratoires: [
      '05 laboratoires de mécanique',
      '02 ateliers d\'usinage',
      '01 laboratoire de CAO/DAO',
      '01 laboratoire de métrologie'
    ],
    debouches: [
      'Technicien en conception mécanique',
      'Technicien en maintenance industrielle',
      'Technicien méthodes',
      'Dessinateur industriel',
      'Responsable production',
      'Technicien qualité'
    ],
    equipe: {
      total: 17,
      composition: [
        '02 maîtres technologues en génie mécanique',
        '08 technologues en génie mécanique',
        '02 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation',
      '01 semestre de stage de fin d\'études',
      'Projets de fin d\'études en collaboration avec l\'industrie'
    ]
  }
];

// GET - Récupérer tous les départements
export async function GET(request: NextRequest) {
  try {
    // Utiliser les mock data temporairement
    return NextResponse.json(mockDepartementsComplets, { status: 200 });
    
    /* Code original avec Prisma (à réactiver après mise à jour de la BD)
    const departements = await prisma.departement.findMany({
      include: {
        specialites: true,
        enseignants: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(departements, { status: 200 });
    */
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouveau département
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du département est requis' },
        { status: 400 }
      );
    }

    const departement = await prisma.departement.create({
      data: {
        nom
      },
      include: {
        specialites: true,
        enseignants: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(departement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
