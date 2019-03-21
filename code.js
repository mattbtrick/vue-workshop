Vue.directive("focus", {
  inserted: function(el) {
    el.focus();
  }
});

Vue.filter("truncate", function(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return value.substring(0, maxLength) + "...";
});

window.vm = new Vue({
  el: "#app",
  data: function() {
    return {
      heading: "To Do List",
      tasks: [],
      newTaskText: "",
      editingTask: null,
      editTaskText: ""
    };
  },
  created: function() {
    var self = this;

    api.getList(function(items) {
      self.tasks = items;
    });
  },
  methods: {
    addTask: function() {
      var self = this;

      var newTask = {
        completed: false,
        dateAdded: new Date(),
        task: self.newTaskText
      };

      api.create(newTask, function(newId) {
        newTask.id = newId;
        self.tasks.push(newTask);
        self.newTaskText = "";
      });
    },
    deleteTask: function(task, index) {
      var self = this;

      api.delete(task.id, function() {
        self.tasks.splice(index, 1);
      });
    },
    setEditingTask: function(task) {
      var self = this;
      self.editingTask = task;
      self.editTaskText = task.task;
    },
    editTask: function() {
      var self = this;
      self.editingTask.task = self.editTaskText;

      api.update(self.editingTask, function() {
        self.editingTask = null;
      });
    }
  }
});
