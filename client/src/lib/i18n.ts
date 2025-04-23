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
    nextTasksToProcess: "Les 2 prochaines tâches à traiter",
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
    cancel: "Annuler"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;

export const t = (key: TranslationKey, lang: Language = "fr"): string => {
  return translations[lang][key] || key;
};

export default translations;
