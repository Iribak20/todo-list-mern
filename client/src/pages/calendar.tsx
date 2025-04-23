import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useTasks } from "@/hooks/useTasks";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/tasks/TaskForm";
import { Task } from "@shared/schema";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { tasks, isLoading } = useTasks();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dayList = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtenir le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
  const startDay = monthStart.getDay();
  
  // Si le premier jour n'est pas un lundi (1), on ajoute des jours vides avant
  const daysBeforeMonth = startDay === 0 ? 6 : startDay - 1;
  const emptyDaysBefore = Array.from({ length: daysBeforeMonth }, (_, i) => 
    addDays(monthStart, -daysBeforeMonth + i)
  );
  
  // Jours complets à afficher
  const allDays = [...emptyDaysBefore, ...dayList];
  
  // Grouper les jours par semaine
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const tasksOnDate = useMemo(() => {
    if (!selectedDate || !tasks) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [selectedDate, tasks]);

  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const renderTasksForDay = (day: Date) => {
    if (!tasks) return null;
    
    const tasksOnThisDay = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
    
    if (tasksOnThisDay.length === 0) return null;
    
    return (
      <div className="absolute bottom-1 right-1 left-1 flex gap-1 flex-wrap justify-end">
        {tasksOnThisDay.length > 2 ? (
          <Badge 
            variant="outline" 
            className="text-xs bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {tasksOnThisDay.length} tâches
          </Badge>
        ) : (
          tasksOnThisDay.map((task, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className={`text-xs ${getTaskStatusClass(task.status)}`}
            >
              {task.title.substring(0, 10)}
              {task.title.length > 10 && '...'}
            </Badge>
          ))
        )}
      </div>
    );
  };

  const getTaskStatusClass = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 hover:bg-slate-200';
      case 'inprogress': return 'bg-blue-100 hover:bg-blue-200';
      case 'done': return 'bg-green-100 hover:bg-green-200';
      default: return 'bg-slate-100 hover:bg-slate-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t("calendar")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Chargement...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{t("calendar")}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium min-w-32 text-center">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Jours de la semaine */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div 
                key={index} 
                className="text-center py-2 font-medium text-sm text-muted-foreground"
              >
                {day}
              </div>
            ))}
            
            {/* Jours du mois */}
            {weeks.flatMap((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={`${weekIndex}-${dayIndex}`} 
                    className={`
                      p-1 h-24 border rounded-md relative
                      ${isCurrentMonth ? 'bg-white' : 'bg-muted/20 text-muted-foreground'}
                      ${isToday ? 'border-primary' : 'border-muted'}
                      hover:bg-muted/10 transition-colors
                      cursor-pointer
                    `}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowTaskForm(true);
                    }}
                  >
                    <div className="text-right text-sm p-1">
                      {format(day, 'd')}
                    </div>
                    {renderTasksForDay(day)}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter ou voir les tâches */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate 
                ? `Tâches pour le ${format(selectedDate, 'd MMMM yyyy', { locale: fr })}`
                : "Nouvelle tâche"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedDate && tasksOnDate.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Tâches existantes</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowTaskForm(false)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une tâche
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tasksOnDate.map((task: Task) => (
                    <div
                      key={task._id}
                      className={`p-3 rounded-md border ${getTaskStatusClass(task.status)}`}
                    >
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">{task.description || "Aucune description"}</div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Assigné à: {task.assignee}</span>
                        <Badge>{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <TaskForm 
                onSuccess={() => setShowTaskForm(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
