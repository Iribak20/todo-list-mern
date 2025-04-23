import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTeam, Team, InsertTeamMember, TeamMember } from "@shared/schema";

// Teams CRUD operations
export const useTeams = () => {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['/api/teams'],
    refetchOnWindowFocus: false
  });

  return {
    teams: teams as Team[] || [],
    isLoading,
    error
  };
};

export const useTeam = (id: string) => {
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['/api/teams', id],
    enabled: !!id
  });

  return {
    team: team as Team | null,
    isLoading,
    error
  };
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (team: InsertTeam) => apiRequest("POST", "/api/teams", team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    }
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, team }: { id: string; team: Partial<Team> }) => 
      apiRequest("PATCH", `/api/teams/${id}`, team),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', variables.id] });
    }
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    }
  });
};

// Team members operations
export const useTeamMembers = (teamId: string) => {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['/api/teams', teamId, 'members'],
    enabled: !!teamId
  });

  return {
    members: members as TeamMember[] || [],
    isLoading,
    error
  };
};

export const useAddTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (member: Omit<InsertTeamMember, 'teamId'>) => 
      apiRequest("POST", `/api/teams/${teamId}/members`, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId, 'members'] });
    }
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) => 
      apiRequest("DELETE", `/api/team-members/${memberId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', variables.teamId, 'members'] });
    }
  });
};