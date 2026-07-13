import { Link } from 'expo-router';
import { Text } from 'react-native';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link href={href as any}>
      <Text className="font-body text-sm text-angkor-orange font-semibold">
        {children}
      </Text>
    </Link>
  );
}
