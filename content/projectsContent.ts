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
    slug: "istanbul-fragments",
    cover: "ist8-street.jpg",
    images: ["ist8-street.jpg", "ist10-street.png", "ist4-street.jpg", "ist2-street.jpg"],
    year: "2025",
    tags: ["street", "istanbul"],
    en: {
      title: "Istanbul Fragments",
      summary: "Passing gestures, dense streets, and fleeting city moments held in quiet frames.",
      intro:
        "A sequence built from short encounters, shifting light, and the texture of movement in Istanbul.",
      body: [
        "These images stay close to the surface of the city without trying to over-explain it. What matters is rhythm, interruption, and the small tensions that appear in everyday motion.",
        "The series is less about landmarks and more about fragments: faces, shadows, pauses, and the brief order that appears inside visual noise.",
      ],
    },
    gr: {
      title: "Istanbul Fragments",
      summary: "Στιγμες του δρομου, περαστικες κινησεις και θραυσματα της πολης σε ησυχα καρε.",
      intro:
        "Μια σειρα απο μικρες συναντησεις, μεταβαλλομενο φως και τη συνεχη κινηση της Κωνσταντινουπολης.",
      body: [
        "Οι εικονες μενουν κοντα στην υφη της πολης χωρις να προσπαθουν να την εξηγησουν. Αυτο που μενει ειναι ο ρυθμος, οι παυσεις και οι μικρες εντασεις της καθημερινης κινησης.",
        "Η σειρα δεν στεκεται στα αξιοθεατα, αλλα στα θραυσματα: προσωπα, σκιες, βλεμματα και μικρες στιγμες ταξης μεσα στον οπτικο θορυβο.",
      ],
    },
  },
  {
    slug: "postcards-from-rome",
    cover: "rome2-archit.png",
    images: ["rome2-archit.png", "rome8-archit-int.png", "rome6-archit.png", "rome3-archit-int.png"],
    year: "2024",
    tags: ["rome", "architecture"],
    en: {
      title: "Postcards from Rome",
      summary: "Architecture, facades, and still interiors shaped by shadow, repetition, and scale.",
      intro:
        "A visual walk through Rome where geometry, silence, and atmosphere carry more weight than the postcard view.",
      body: [
        "The photographs move between exterior form and interior quiet. They are interested in how light redraws buildings and how space becomes rhythm.",
        "Rather than documenting monuments, the series looks for the calm relationships between surface, depth, pattern, and pause.",
      ],
    },
    gr: {
      title: "Postcards from Rome",
      summary: "Οψεις, εσωτερικοι χωροι και αρχιτεκτονικες σιωπες μεσα απο σκια και κλιμακα.",
      intro:
        "Μια οπτικη διαδρομη στη Ρωμη οπου η γεωμετρια, η ησυχια και η ατμοσφαιρα εχουν μεγαλυτερη σημασια απο την κλασικη καρτ-ποσταλ.",
      body: [
        "Οι εικονες κινουνται αναμεσα στην εξωτερικη μορφη και την εσωτερικη ηρεμια. Τις ενδιαφερει ο τροπος που το φως ξανασχεδιαζει τα κτιρια και κανει τον χωρο να λειτουργει σαν ρυθμος.",
        "Αντι να καταγραφουν μνημεια, αναζητουν ησυχες σχεσεις αναμεσα σε επιφανεια, βαθος, επαναληψη και παυση.",
      ],
    },
  },
  {
    slug: "greece-the-blue-chapters",
    cover: "greece1-landsc.png",
    images: ["greece1-landsc.png", "greece2-landsc.png", "greece4-street.png", "greece5-street.png"],
    year: "2025",
    tags: ["greece", "landscape"],
    en: {
      title: "Greece, the Blue Chapters",
      summary: "Sea light, island surfaces, and open horizons arranged like fragments of a summer diary.",
      intro:
        "A sequence shaped by water, bright air, and the stillness that arrives around coastal landscapes.",
      body: [
        "These photographs hold on to the slower tempo of Greek summer. Blue becomes structure, not decoration, giving the series its visual continuity.",
        "The work moves between landscape and lived atmosphere, searching for the calm tension between distance, sunlight, and memory.",
      ],
    },
    gr: {
      title: "Greece, the Blue Chapters",
      summary: "Θαλασσα, φωτεινος αερας και ανοιχτοι οριζοντες σαν σε σελιδες καλοκαιρινου ημερολογιου.",
      intro:
        "Μια σειρα που γεννιεται απο το νερο, το φως και την ησυχια που απλωνεται γυρω απο τα ελληνικα τοπια.",
      body: [
        "Οι εικονες κρατουν τον αργο ρυθμο του ελληνικου καλοκαιριου. Το μπλε λειτουργει ως δομη και οχι ως διακοσμηση, ενωνοντας τη σειρα.",
        "Η δουλεια κινειται αναμεσα στο τοπιο και την ατμοσφαιρα της ζωης, αναζητωντας τη λεπτη σχεση αναμεσα σε αποσταση, ηλιο και μνημη.",
      ],
    },
  },
  {
    slug: "a-diary-of-loved-faces",
    cover: "rome4-int.png",
    images: ["rome4-int.png", "skg1-street-int.jpg", "ist15-landsc.jpg", "rome8-archit-int.png"],
    year: "2025",
    tags: ["portrait", "intimate"],
    en: {
      title: "A Diary of Loved Faces",
      summary: "Portrait-led frames shaped by trust, quiet attention, and the intimacy of familiar presence.",
      intro:
        "A softer body of work where portraiture becomes a personal diary of stillness, closeness, and atmosphere.",
      body: [
        "These photographs are built slowly. They stay near expression, breath, and the subtle emotional texture that appears when someone is fully at ease.",
        "The series values affection without sentimentality, allowing the frame to stay open, simple, and emotionally precise.",
      ],
    },
    gr: {
      title: "A Diary of Loved Faces",
      summary: "Πορτραιτα με ησυχια, οικειοτητα και την τρυφερη ακριβεια της γνωριμης παρουσιας.",
      intro:
        "Μια πιο προσωπικη σειρα οπου το πορτραιτο λειτουργει σαν ημερολογιο εγγυτητας, ηρεμιας και ατμοσφαιρας.",
      body: [
        "Οι φωτογραφιες αυτες χτιζονται αργα και με εμπιστοσυνη. Μενουν κοντα στην εκφραση, στην ανασα και στη λεπτη συναισθηματικη υφη που εμφανιζεται οταν καποιος νιωθει ανετα.",
        "Η σειρα κρατα την οικειοτητα χωρις υπερβολη, αφηνοντας το καδρο να παραμενει απλο, ανοιχτο και ακριβες.",
      ],
    },
  },
  {
    slug: "among-strangers",
    cover: "greece3-street.png",
    images: ["greece3-street.png", "skg2-street.png", "rome7-street.png", "skg3-street.png"],
    year: "2025",
    tags: ["street", "people"],
    en: {
      title: "Among Strangers",
      summary: "Street photographs of anonymous proximity, shared space, and the brief theater of public life.",
      intro:
        "A series about being near other people without knowing them, and about the charged distance that public space creates.",
      body: [
        "The work is drawn to glances, interruptions, crossings, and the way unrelated lives briefly align in the same frame.",
        "There is tension here, but also tenderness. The images treat strangers not as spectacle, but as part of a shared visual rhythm.",
      ],
    },
    gr: {
      title: "Among Strangers",
      summary: "Εικονες δρομου για την ανωνυμη εγγυτητα, τον κοινο χωρο και το συντομο θεατρο της δημοσιας ζωης.",
      intro:
        "Μια σειρα για το πώς βρισκομαστε κοντα σε αλλους ανθρωπους χωρις να τους γνωριζουμε, και για την αποσταση που γεννα ο δημοσιος χωρος.",
      body: [
        "Η δουλεια στρεφεται σε βλεμματα, διασταυρωσεις, διακοπες και στις στιγμες που ασχετες ζωες ευθυγραμμιζονται για λιγο στο ιδιο καδρο.",
        "Υπαρχει ενταση, αλλα και τρυφεροτητα. Οι αγνωστοι δεν αντιμετωπιζονται σαν θεαμα, αλλα σαν μερος ενος κοινου οπτικου ρυθμου.",
      ],
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projectsContent.find((project) => project.slug === slug);
}
