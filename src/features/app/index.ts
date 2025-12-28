import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { REHYDRATE } from 'redux-persist';
import { InitialStateProps, User } from "./types"


const initialState: InitialStateProps = {
    login: false,
    token: null,
    user: null,
    encryptionKey: null,
    dateFormat: 'standard',
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
        setDateFormat: (state, action: PayloadAction<'relative' | 'standard'>) => {
            state.dateFormat = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(REHYDRATE, (state, action: any) => {
            // Redux-persist'ten veriler yüklendiğinde, token ve user varsa login durumunu true yap
            if (action.payload) {
                const persistedState = action.payload.app || action.payload;
                if (persistedState?.token && persistedState?.user) {
                    state.login = true;
                    state.token = persistedState.token;
                    state.user = persistedState.user;
                    state.encryptionKey = persistedState.encryptionKey || null;
                    state.dateFormat = persistedState.dateFormat || 'standard';
                }
            }
        });
    }
})

export const {
    setLogin,
    logout,
    setEncryptionKey,
    setDateFormat,
} = appSlice.actions;

export default appSlice.reducer;