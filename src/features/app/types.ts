export interface User {
    user_id: number;
    name: string;
    surname: string;
    email: string;
    onesignal_id?: string;
    encrypted: boolean;
}

export interface InitialStateProps {
    login: boolean;
    token: string | null;
    user: User | null;
    encryptionKey: string | null;
}
