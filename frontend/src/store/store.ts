import { configureStore, combineReducers } from "@reduxjs/toolkit";
import interviewReducer from "./features/interviewSlice";
import dialogReducer from "./features/dialogSlice";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// persist config
const persistConfig = {
  key: "root",       
  version: 1,   
  storage,
  whitelist: ["interview"],
};

//Combine reducers
const rootReducer = combineReducers({
  interview: interviewReducer,
  dialog:dialogReducer
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
