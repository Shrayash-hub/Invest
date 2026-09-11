import { EventEmitter } from "events";

/**
 * Creates a stream emitter for a single research session.
 * @returns {EventEmitter & { emitEvent: Function, getEvents: Function }}
 */
export function createStreamEmitter() {
  const emitter = new EventEmitter();
  const events = [];

  emitter.emitEvent = (type, node, message, data = null) => {
    const event = {
      type,
      node,
      message,
      data,
      timestamp: Date.now(),
    };
    events.push(event);
    emitter.emit("event", event);
    return event;
  };

  emitter.getEvents = () => [...events];

  return emitter;
}
