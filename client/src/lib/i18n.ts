const translations = {
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    taskList: "Liste des tâches",
    teams: "Équipes",
    discussions: "Discussions",
    performance: "Tableau de performance",
    calendar: "Calendrier",
    
    // Welcome section
    welcome: "Bienvenue",
    welcomeDescription: "Voici un aperçu de votre progression et de vos tâches à venir",
    
    // Stats cards
    totalTasks: "Total des tâches",
    allActiveTasks: "Toutes vos tâches actives",
    toDo: "À faire",
    tasksToStart: "Tâches à commencer",
    inProgress: "En cours",
    tasksInProgress: "Tâches en progression",
    completed: "Terminées",
    tasksCompleted: "des tâches terminées",
    
    // Charts & Upcoming tasks
    taskDistribution: "Répartition des tâches",
    taskDistributionDesc: "Vue d'ensemble de l'état de vos tâches",
    upcomingTasks: "Tâches à venir",
    nextTasksToProcess: "Les 3 prochaines tâches à traiter",
    viewAllTasks: "Voir toutes les tâches",
    
    // Task table
    task: "Tâche",
    assignedTo: "Assigné à",
    deadline: "Deadline",
    priority: "Priorité",
    status: "Statut",
    actions: "Actions",
    searchTasks: "Rechercher des tâches...",
    newTask: "Nouvelle",
    showing: "Affichage de",
    of: "sur",
    tasks: "tâches",
    
    // Priorities
    low: "Basse",
    medium: "Moyen",
    high: "Haut",
    
    // Status
    todo: "À faire",
    inprogress: "En cours",
    done: "Terminée",
    
    // Task modal
    createTask: "Créer une nouvelle tâche",
    taskTitle: "Titre de la tâche",
    description: "Description",
    dueDate: "Date d'échéance",
    save: "Enregistrer",
    cancel: "Annuler",
    
    // Teams
    myTeams: "Mes équipes",
    createTeam: "Créer une équipe",
    teamName: "Nom de l'équipe",
    teamDescription: "Description de l'équipe",
    teamLeader: "Chef d'équipe",
    members: "Membres",
    addMember: "Ajouter un membre",
    removeMember: "Retirer",
    role: "Rôle",
    leader: "Chef",
    member: "Membre",
    observer: "Observateur",
    teamPerformance: "Performance de l'équipe",
    tasksCompletedByTeam: "Tâches complétées par l'équipe",
    createNewTeam: "Créer une nouvelle équipe",
    
    // Discussions
    allDiscussions: "Toutes les discussions",
    createDiscussion: "Nouvelle discussion",
    discussionTitle: "Titre de la discussion",
    discussionContent: "Contenu",
    author: "Auteur",
    category: "Catégorie",
    general: "Général",
    technical: "Technique",
    help: "Aide",
    announcement: "Annonce",
    comments: "Commentaires",
    leaveComment: "Laisser un commentaire",
    postComment: "Publier",
    views: "Vues",
    likes: "J'aime",
    lastUpdated: "Dernière mise à jour",
    
    // Performance
    performanceMetrics: "Métriques de performance",
    topPerformers: "Meilleurs performeurs",
    completionRate: "Taux d'achèvement",
    onTimeCompletion: "Achèvement à temps",
    tasksCreated: "Tâches créées",
    userPerformance: "Performance de l'utilisateur",
    weeklyScore: "Score hebdomadaire",
    monthlyScore: "Score mensuel",
    overdueTasks: "Tâches en retard",
    
    // General
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    filter: "Filtrer",
    apply: "Appliquer",
    clear: "Effacer",
    search: "Rechercher",
    noResults: "Aucun résultat trouvé",
    confirm: "Confirmer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément?",
    success: "Succès",
    error: "Erreur",
    teamMembersSoon: "Fonctionnalité de gestion des membres à venir bientôt...",
    successTeamCreate: "Équipe créée avec succès!",
    successDiscussionCreate: "Discussion créée avec succès!"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;

export const t = (key: TranslationKey, lang: Language = "fr"): string => {
  return translations[lang][key] || key;
};

export default translations;
