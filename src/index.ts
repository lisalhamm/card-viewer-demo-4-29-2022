/* eslint-disable max-statements */
import {
  type OnCopyToClipboardSuccessPayload,
  renderFields,
} from "@highnoteplatform/card-viewer";
import type { DeepReadonly } from "ts-essentials";
import "./index.css";

const { CARD_VIEWER_CLIENT_TOKEN, PAYMENT_CARD_ID } = process.env;

const resolvePaymentCardConfig = (): Record<
  "clientToken" | "paymentCardId",
  string
> => {
  const url = new URL(location.href);

  return {
    clientToken:
      url.searchParams.get("clientToken") ?? CARD_VIEWER_CLIENT_TOKEN ?? "",

    paymentCardId:
      url.searchParams.get("paymentCardId") ?? PAYMENT_CARD_ID ?? "",
  };
};

// eslint-disable-next-line fp/no-let
let cardViewerIsMounted = false;

void (async () => {
  const form = document.querySelector("form");

  if (form === null) {
    throw new Error("Could not find form element.");
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
  const paymentCardIdField = form.querySelector(
    "#paymentCardId"
  )! as HTMLInputElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
  const clientTokenField = form.querySelector(
    "#clientToken"
  )! as HTMLInputElement;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const paymentCardId = (
      (event.target as HTMLFormElement).paymentCardId as HTMLInputElement
    ).value;
    const clientToken = (
      (event.target as HTMLFormElement).clientToken as HTMLInputElement
    ).value;

    location.search = `?clientToken=${clientToken}&paymentCardId=${paymentCardId}`;
  });

  const { clientToken, paymentCardId } = resolvePaymentCardConfig();

  paymentCardIdField.value = paymentCardId;
  clientTokenField.value = clientToken;

  const cardViewer = await renderFields({
    clientToken,
    paymentCardId,

    onCopyToClipboardSuccess: ({
      field,
    }: DeepReadonly<OnCopyToClipboardSuccessPayload>) => {
      // eslint-disable-next-line no-console
      console.log(`[Integrator log]: ${field} value copied!`);
    },

    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error(`[Integrator error handler]:`, error);
    },

    elements: {
      cardNumber: {
        selector: "#cardNumber",

        styles: {
          color: "black",
          fontFamily: "monospace",
          cursor: "pointer",
          fontWeight: "medium",
          fontSize: "1rem",

          ":hover": {
            backgroundColor: "rgba(0, 0, 0, .2)",
          },
        },
      },

      cvv: {
        selector: "#cvv",

        styles: {
          color: "black",
          fontFamily: "monospace",
          cursor: "pointer",
          fontWeight: "medium",
          fontSize: "1rem",

          ":hover": {
            backgroundColor: "rgba(0, 0, 0, .2)",
          },
        },
      },

      expirationDate: {
        selector: "#expirationDate",

        styles: {
          color: "black",
          fontFamily: "monospace",
          cursor: "pointer",
          fontWeight: "medium",
          fontSize: "1rem",

          ":hover": {
            backgroundColor: "rgba(0, 0, 0, .2)",
          },
        },
      },
    },
  });

  // eslint-disable-next-line fp/no-mutation
  cardViewerIsMounted = true;

  const toggleCardMaskButton = document.querySelector("#toggleCardNumber");

  if (toggleCardMaskButton !== null) {
    toggleCardMaskButton.addEventListener("click", () => {
      cardViewer.toggleCardNumberMask();
    });
  }

  const unmountButton = document.querySelector("#unmount");

  if (unmountButton !== null) {
    unmountButton.addEventListener("click", async (event) => {
      if (cardViewerIsMounted) {
        await cardViewer.unmount();

        // eslint-disable-next-line fp/no-mutation, no-param-reassign
        (event.target as HTMLButtonElement).textContent = "Start Over";

        // eslint-disable-next-line fp/no-mutation, require-atomic-updates
        cardViewerIsMounted = false;
      } else {
        location.reload();
      }
    });
  }
})();