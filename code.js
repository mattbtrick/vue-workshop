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

var taskFormComponent = {
  props: {
    task: {
      type: Object,
      default: null
    }
  },
  data: function() {
    var self = this;

    return {
      taskText: self.task ? self.task.task : ""
    };
  },
  computed: {
    isAdd: function() {
      var self = this;
      return self.task === null;
    },
    placeholder: function() {
      var self = this;
      return self.isAdd ? "Add a task" : "Edit this task";
    }
  },
  methods: {
    handleSubmit: function() {
      var self = this;
      self.$emit("submit", self.taskText);

      if (self.isAdd) {
        self.taskText = "";
      }
    }
  },
  template: "#task-form-template"
};

window.vm = new Vue({
  el: "#app",
  components: {
    taskForm: taskFormComponent
  },
  data: function() {
    return {
      heading: "To Do List",
      tasks: [],
      editingTask: null,
      searchValue: ""
    };
  },
  created: function() {
    var self = this;

    api.getList(function(items) {
      self.tasks = items;
    });
  },
  methods: {
    addTask: function(text) {
      var self = this;

      var newTask = {
        completed: false,
        dateAdded: new Date(),
        task: text
      };

      api.create(newTask, function(newId) {
        newTask.id = newId;
        self.tasks.push(newTask);
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
    editTask: function(text) {
      var self = this;
      self.editingTask.task = text;

      api.update(self.editingTask, function() {
        self.editingTask = null;
      });
    }
  },
  computed: {
    filteredTasks: function() {
      var self = this;

      if (!self.searchValue) {
        return self.tasks;
      }

      return self.tasks.filter(function(value) {
        return value.task
          .toLowerCase()
          .includes(self.searchValue.toLowerCase());
      });
    }
  }
});
