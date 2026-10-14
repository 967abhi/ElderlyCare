// Two Cloud Functions in one package. Each is deployed separately with its
// own --entry-point, so each gets its own Pub/Sub subscription and retries
// on its own.
require("dotenv").config({ quiet: true });
const functions = require("@google-cloud/functions-framework");
const { handleCloudEvent } = require("./src/handler");
const deps = require("./src/deps");

functions.cloudEvent("notifyCaretaker", (cloudEvent) =>
  handleCloudEvent("notifyCaretaker", cloudEvent, deps)
);

functions.cloudEvent("notifyFamily", (cloudEvent) =>
  handleCloudEvent("notifyFamily", cloudEvent, deps)
);
