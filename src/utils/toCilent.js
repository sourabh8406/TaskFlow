function toClient(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };

  obj.id = String(obj._id);
  delete obj._id;
  delete obj.__v;
  delete obj.password;

  if (obj.owner) {
    obj.owner = toClient(obj.owner);
  }
  if (obj.members) {
    obj.members = obj.members.map((member) => toClient(member));
  }
  if (obj.tasks) {
    obj.tasks = obj.tasks.map((task) => toClient(task));
  }
  if (obj.comments) {
    obj.comments = obj.comments.map((comment) => toClient(comment));
  }
  if (obj.subtasks) {
    obj.subtasks = obj.subtasks.map((subtask) => toClient(subtask));
  }
  if (obj.attachments) {
    obj.attachments = obj.attachments.map((attachment) => toClient(attachment));
  }
  if (obj.labels) {
    obj.labels = obj.labels.map((label) => toClient(label));
  }
  if (obj.checklists) {
    obj.checklists = obj.checklists.map((checklist) => toClient(checklist));
  }
  if (obj.activities) {
    obj.activities = obj.activities.map((activity) => toClient(activity));
  }
  if (obj.project) {
    obj.project = toClient(obj.project);
  }

  return obj;
}

function toClientList(docs) {
  return docs.map((doc) => toClient(doc));
}

module.exports = { toClient, toClientList };
