import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistGate } from "redux-persist/integration/react";
import { AxiosInterceptor } from "api/api";
import store, { persistor } from "./app/store";
import App from "./App";

const queryClient = new QueryClient();

const container = document.getElementById("root") as HTMLDivElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <AxiosInterceptor>
          <App />
        </AxiosInterceptor>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>,
);
