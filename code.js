Vue.directive('focus', {
    inserted: function(el) {
        el.focus()
    }
})


window.vm = new Vue({
    el: '#app',
    data: function() {
        return {
            heading: 'To Do List',
            tasks: [],
            newTask: null
        };
    },
    created: function() {
        this.getTasks();
    },
    methods: {
        getTasks: function() {
            var self = this;
            api.getList(function(tasks) {
                self.tasks = tasks;
            });
        },
        addTask: function() {
            var self = this;
            var task = {
                task: self.newTask
            };

            api.create(task, function(id) {
                api.get(id, function(task) {
                    self.tasks.push(task);
                    self.newTask = null;
                });
            });
        }
    }
});
