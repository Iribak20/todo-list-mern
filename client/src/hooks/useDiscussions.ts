import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertDiscussion, Discussion, InsertComment, Comment, DiscussionCategory } from "@shared/schema";

// Discussions CRUD operations
export const useDiscussions = () => {
  const { data: discussions, isLoading, error } = useQuery({
    queryKey: ['/api/discussions'],
    refetchOnWindowFocus: false
  });

  return {
    discussions: discussions as Discussion[] || [],
    isLoading,
    error,
    discussionsByCategory: (category: DiscussionCategory) => 
      (discussions as Discussion[] || []).filter(d => d.category === category),
    discussionsByTeam: (teamId: number) => 
      (discussions as Discussion[] || []).filter(d => d.teamId === teamId)
  };
};

export const useDiscussion = (id: string) => {
  const { data: discussion, isLoading, error } = useQuery({
    queryKey: ['/api/discussions', id],
    enabled: !!id
  });

  return {
    discussion: discussion as Discussion | null,
    isLoading,
    error
  };
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (discussion: InsertDiscussion) => 
      apiRequest("POST", "/api/discussions", discussion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
    }
  });
};

export const useUpdateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, discussion }: { id: string; discussion: Partial<Discussion> }) => 
      apiRequest("PATCH", `/api/discussions/${id}`, discussion),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions', variables.id] });
    }
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/discussions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
    }
  });
};

// Comments operations
export const useComments = (discussionId: string) => {
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['/api/discussions', discussionId, 'comments'],
    enabled: !!discussionId
  });

  return {
    comments: comments as Comment[] || [],
    isLoading,
    error
  };
};

export const useCreateComment = (discussionId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (comment: Omit<InsertComment, 'discussionId'>) => 
      apiRequest("POST", `/api/discussions/${discussionId}/comments`, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions', discussionId, 'comments'] });
    }
  });
};

export const useDeleteComment = (discussionId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => apiRequest("DELETE", `/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions', discussionId, 'comments'] });
    }
  });
};