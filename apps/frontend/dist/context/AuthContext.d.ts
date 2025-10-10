import { UserRole } from '@common/src/schemas/primitives';
type User = {
    id: string;
    role: UserRole;
} | null;
export declare const AuthProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react").JSX.Element;
export declare const useAuth: () => {
    user: User;
};
export {};
