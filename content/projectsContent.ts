export type ProjectContent = {
  slug: string;
  cover: string;
  images: string[];
  year: string;
  tags: string[];
  en: {
    title: string;
    summary: string;
    intro: string;
    body: string[];
  };
  gr: {
    title: string;
    summary: string;
    intro: string;
    body: string[];
  };
};

export const projectsContent: ProjectContent[] = [
  {
    slug: "street-athens",
    cover: "ist8-street.jpg",
    images: ["ist8-street.jpg", "greece3-street.png", "ist10-street.png", "ist4-street.jpg"],
    year: "2025",
    tags: ["street", "athens"],
    en: {
      title: "Street Athens",
      summary: "Quiet street observations, passing gestures, and fragments of urban rhythm.",
      intro:
        "A study of presence in the city, built from small encounters, sudden light, and the spaces between movement.",
      body: [
        "This series stays close to everyday motion without forcing a spectacle out of it. I am interested in moments that feel almost invisible until the frame holds them still.",
        "People, shadows, and architecture meet each other in ways that are subtle but charged. The work is less about the event and more about the atmosphere surrounding it.",
      ],
    },
    gr: {
      title: "Street Athens",
      summary: "Ησυχες παρατηρησεις δρομου, περαστικες κινησεις και θραυσματα αστικου ρυθμου.",
      intro:
        "Μια μελετη πανω στην παρουσια μεσα στην πολη, χτισμενη απο μικρες συναντησεις, ξαφνικο φως και τα κενα αναμεσα στην κινηση.",
      body: [
        "Η σειρα μενει κοντα στην καθημερινη κινηση χωρις να αναγκαζει το καδρο να γινει θεαμα. Με ενδιαφερουν οι στιγμες που μοιαζουν σχεδον αορατες μεχρι να σταματησουν μεσα στην εικονα.",
        "Ανθρωποι, σκιες και αρχιτεκτονικη συναντιουνται με τροπους διακριτικους αλλα φορτισμενους. Η δουλεια δεν ειναι τοσο για το συμβαν οσο για την ατμοσφαιρα που το περιβαλλει.",
      ],
    },
  },
  {
    slug: "rome-geometry",
    cover: "rome2-archit.png",
    images: ["rome2-archit.png", "rome8-archit-int.png", "rome6-archit.png", "rome3-archit-int.png"],
    year: "2024",
    tags: ["architecture", "rome"],
    en: {
      title: "Rome Geometry",
      summary: "Lines, facades, and interior tension shaped through shadow and scale.",
      intro:
        "An architectural sequence focused on structure, repetition, and the visual calm that emerges from ordered space.",
      body: [
        "These photographs look at architecture not as documentation but as rhythm. I am drawn to edges, intervals, and the quiet precision of built form.",
        "Rome becomes less of a landmark and more of a set of relationships between surface, depth, and the way light redraws the same space through the day.",
      ],
    },
    gr: {
      title: "Rome Geometry",
      summary: "Γραμμες, οψεις και εσωτερικη ενταση μεσα απο σκια και κλιμακα.",
      intro:
        "Μια αρχιτεκτονικη σειρα που εστιαζει στη δομη, την επαναληψη και την οπτικη ηρεμια που προκυπτει απο τον οργανωμενο χωρο.",
      body: [
        "Οι φωτογραφιες αυτες βλεπουν την αρχιτεκτονικη οχι σαν καταγραφη αλλα σαν ρυθμο. Με ελκουν οι ακμες, τα διαστηματα και η σιωπηλη ακριβεια της κατασκευης.",
        "Η Ρωμη γινεται λιγοτερο τοποσημο και περισσοτερο ενα συστημα σχεσεων αναμεσα σε επιφανεια, βαθος και στον τροπο που το φως ξανασχεδιαζει τον ιδιο χωρο μεσα στη μερα.",
      ],
    },
  },
  {
    slug: "quiet-portraits",
    cover: "skg1-street-int.jpg",
    images: ["skg1-street-int.jpg", "rome4-int.png", "greece1-landsc.png", "ist15-landsc.jpg"],
    year: "2025",
    tags: ["portrait", "atmosphere"],
    en: {
      title: "Quiet Portraits",
      summary: "Portrait-led frames that stay close to stillness, mood, and natural light.",
      intro:
        "A quieter body of work where portraiture opens into atmosphere, allowing the subject and the space around them to breathe equally.",
      body: [
        "These frames are built slowly. The aim is not performance but presence: a face, a pause, a room, a fragment of light.",
        "What matters here is trust and tone. The photographs remain intimate, but they also leave room for ambiguity and softness.",
      ],
    },
    gr: {
      title: "Quiet Portraits",
      summary: "Πορτραιτα που μενουν κοντα στην ησυχια, τη διαθεση και το φυσικο φως.",
      intro:
        "Μια πιο ησυχη σωματα δουλειας οπου το πορτραιτο ανοιγει προς την ατμοσφαιρα και αφηνει ισο χωρο στο προσωπο και στο περιβαλλον του.",
      body: [
        "Τα καδρα αυτα χτιζονται αργα. Ο στοχος δεν ειναι η επιδειξη αλλα η παρουσια: ενα προσωπο, μια παυση, ενα δωματιο, ενα κομματι φωτος.",
        "Αυτο που μετρα εδω ειναι η εμπιστοσυνη και ο τονος. Οι φωτογραφιες μενουν οικειες αλλα αφηνουν και χωρο για αμφισημια και ηρεμια.",
      ],
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projectsContent.find((project) => project.slug === slug);
}

