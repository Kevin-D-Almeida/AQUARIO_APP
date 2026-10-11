import { Redirect } from "expo-router";
import { useAuth } from "@/src/providers/auth-provider";
import { LoadingState } from "@/src/shared/components/ui";

export default function Index() {
  const { isAuthenticated, isRestoringSession } = useAuth();
  if (isRestoringSession) return <LoadingState />;

  return <Redirect href={isAuthenticated ? "/aquariums" : "/login"} />;
}
