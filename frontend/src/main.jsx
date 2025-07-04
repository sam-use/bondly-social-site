import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./styles.css";

import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

const persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<p className="text-center">Loading...</p>} persistor={persistor}>
        <App />
        <Toaster position="top-right" />
      </PersistGate>
    </Provider>
  </StrictMode>
);
