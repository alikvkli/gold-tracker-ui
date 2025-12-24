import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { InitialStateProps, User } from "./types"


const initialState: InitialStateProps = {
    login: false,
    token: null,
    user: null,
    encryptionKey: null,
}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setLogin: (state, action: PayloadAction<{ user: User, token: string }>) => {
            state.login = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.login = false;
            state.user = null;
            state.token = null;
            state.encryptionKey = null;
        },
        setEncryptionKey: (state, action: PayloadAction<string | null>) => {
            state.encryptionKey = action.payload;
        },
    }
})

export const {
    setLogin,
    logout,
    setEncryptionKey,
} = appSlice.actions;

export default appSlice.reducer;