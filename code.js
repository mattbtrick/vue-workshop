Vue.component("datePicker", {
  props: {
    value: [String]
  },
  data: function() {
    var self = this;

    return {
      date: self.value
    };
  },
  methods: {
    formatValueForPlugin: function(date) {
      if (date === null) {
        return null;
      }

      date = new Date(date);
      return date.toLocaleDateString();
    },
    handleChange: function(value) {
      var self = this;
      self.$emit("input", value);
      self.$emit("change", value);
    },
    setValue: function() {
      this.date = this.value;
    }
  },
  watch: {
    value: function() {
      var self = this;
      self.setValue();
    },
    date: function() {
      this.handleChange(this.date);
    }
  },
  mounted: function() {},
  template:
    '<b-form-input id="dateDueForm" type="date" size="sm" v-model="date" />'
});

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

Vue.filter("formatDate", function(date) {
  if (!date) {
    return "";
  }
  date = new Date(date);
  return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
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
      taskText: self.task ? self.task.task : "",
      dateDue: self.task ? self.task.dateDue : new Date().toLocaleDateString()
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

      self.$emit("submit", {
        task: self.taskText,
        dateDue: self.dateDue
      });

      if (self.isAdd) {
        self.taskText = "";
      }
    }
  },
  template: "#task-form-template"
};

var taskItemComponent = {
  components: {
    taskForm: taskFormComponent,
    taskItem: taskItemComponent
  },
  props: {
    task: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    deleteTask: function() {
      this.$emit("delete-task", this.task);
    },
    saveTask: function(formTask) {
      var self = this;
      self.task.task = formTask.task;
      api.update(self.task, function() {});
      this.$emit("quit-editing");
    },
    completeTask: function() {
      var self = this;
      this.task.completed = !this.task.completed;
      api.update(self.task, function() {});
    },
    editTask: function() {
      var self = this;
      self.$emit("edit-task", self.task);
    }
  },
  computed: {
    daysOld: function() {
      var today = new Date();
      var started = new Date(this.task.dateAdded);
      var msPerDay = 1000 * 60 * 60 * 24;
      return Math.round((today - started) / msPerDay);
    }
  },
  template: "#task-item-template"
};

window.vm = new Vue({
  el: "#app",
  components: {
    taskForm: taskFormComponent,
    taskItem: taskItemComponent
  },
  data: function() {
    return {
      heading: "To Do List",
      tasks: [],
      editingTask: null,
      searchValue: null,
      taskLoaded: false
    };
  },
  created: function() {
    var self = this;

    api.getList(function(items) {
      self.tasks = items;
      self.taskLoaded = true;
    });
  },
  methods: {
    addTask: function(task) {
      var self = this;

      var newTask = {
        completed: false,
        dateAdded: new Date(),
        task: task.task,
        dateDue: task.dateDue
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
    editTask: function(task) {
      var self = this;

      self.editingTask.task = task.task;
      self.editingTask.dateDue = task.dateDue;
      api.update(self.editingTask, function() {
        self.editingTask = null;
      });
    },
    completeTask: function(task) {
      var self = this;
      task.completed = !task.completed;
      api.update(task, function() {});
    },
    quitEditing: function() {
      var self = this;
      self.editingTask = null;
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
