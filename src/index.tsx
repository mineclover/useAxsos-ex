import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./assets/fonts/fonts.css";

const container = document.getElementById("root") as HTMLDivElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);