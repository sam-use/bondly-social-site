import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import postReducer from "./postSlice";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import socket from "@/socket";
import socketslice from "./socketslice";

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  socketio: socketslice, // Assuming you have a socket reducer
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["socketio"], // 👈 prevent persisting socket state
};


const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
 middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, "socketslice/setSocket"],
      ignoredPaths: ["socketio.socket"],
    },
  }),

});

export default store;
