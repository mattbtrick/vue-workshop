# Step 1 - Bind and show list. #
1. Talk about the {{ heading }} and what it does.
2. How does it know where to pull the data from? (element id)
1. Add v-cloak and talk about what it does. (do we still need the style?)
    ```css
    [v-cloak] {
        display: none;
    }

    ```
2. Add task array to data in code.js.
    `tasks: []`
3. Add getTask method to code.js.
    ```javascript
    getTasks: function() {
        var self = this;
        api.getList(function(tasks) {
            self.tasks = tasks;
        });
    }
    ```
4. Call the getTask function in the created hook.
5. Add task via v-for over li elements in a ol.
    1. talk about key
    2. Different v-for functionality ie. (item, index)
    ```html
    <ol>
        <li v-for="t in tasks" v-bind:key="t.id">
            {{ t.task }}
        </li>
    </ol>
    ```
# Step 2 - Add create list item functionality. #
1. Add newTask to data in code.js. (`newTask: null`)

1. Add form to handle addition.
    ```html
    <form v-on:submit.prevent="addTask">
        <input type="text" required placeholder="New task" v-model="newTask">
        <input type="submit" value="Add Task">
    </form>
    ```
1. Add method to create new list item to code.js.
    ```javascript
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
    ```
1. Tell the html what it should do on submit.
    ```html
    <form v-on:submit.prevent="addTask">
    ```
1. Add focus directive.
    ```javascript
    Vue.directive('focus', {
        inserted: function(el) {
            el.focus()
        }
    })
    ```

# Step 3 - Adding delete functionality. #
1. Add add method in code.js
    ```javascript
    deleteTask: function(index) {
        var self = this;
        var task = self.tasks[index];
        api.delete(task.id, function() {
            self.tasks.splice(index, 1);
        });
    }
    ```
2. Change update list in index.html
    ```html
    <li v-for="(t, i) in tasks" v-bind:key="t.id">
        {{ t.task }} <button v-on:click="deleteTask(i)">Delete</button>
    </li>
    ```

# Step 4 - Add edit functionality. #
1. Add data variables to code.js.
    ```javascript
    newTaskText: '',
    editingTask: null,
    editTaskText: ''
    ```
2. Add edit functions to code.js.
    ```javascript
    setEditingTask: function (task) {
        var self = this;
        self.editingTask = task;
        self.editTaskText = task.task;
    },
    editTask: function () {
    var self = this;
    self.editingTask.task = self.editTaskText;

    api.update(self.editingTask, function () {
        self.editingTask = null;
    });
    }
    ```
3. Update html inside of v-for in index.html
    ```html
    <div v-if="editingTask !== t">
        {{t.task}}
        <button v-on:click="setEditingTask(t)">Edit</button>
        <button v-on:click="deleteTask(t, i)">Delete</button>
    </div>

    <form v-else v-on:submit.prevent="editTask">
        <input type="text" v-model="editTaskText" placeholder="Edit task" />
        <input type="submit" />
    </form>
    ```

# Step 5 - Add vue filter functionality. #
1. Explain what vue filter functionality is [vue filters](https://vuejs.org/v2/guide/filters.html)
2. Add truncate filter to code.js
    ```javascript
    Vue.filter('truncate', function (value, maxLength) {
        if (value.length <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength) + '...';
    });
    ```
3. Add code in index.html to use new filter.
    ```html
    {{t.task | truncate(20) }}
    ```

# Step 6 - Update to use a component. #
1. Add refactor code to use component in code.js.
    ```javascript
    var taskFormComponent = {
        props: {
            task: {
            type: Object,
            default: null
            }
        },
        data: function () {
            var self = this;

            return {
            taskText: self.task ? self.task.task : ''
            };
        },
        computed: {
            isAdd: function () {
            var self = this;
            return self.task === null;
            },
            placeholder: function () {
            var self = this;
            return self.isAdd ? 'Add a task' : 'Edit this task';
            }
        },
        methods: {
            handleSubmit: function () {
            var self = this;
            self.$emit('submit', self.taskText);

            if (self.isAdd) {
                self.taskText = '';
            }
            }
        },
        template: '#task-form-template'
    };
    ```
2. Tell vue to use component in code.js.
    ```javascript
    components: {
      taskForm: taskFormComponent
    },
    ```
3. Update add / update functions to accept text.
    
4. Add component html to index.html
    ```html
    <script type="text/html" id="task-form-template">
      <form v-on:submit.prevent="handleSubmit">
        <input type="text" v-focus v-model="taskText" v-bind:placeholder="placeholder" />
        <input type="submit" />
      </form>
    </script>
    ```
5. Replace forms in index.html to use new component.
    ```html
    <task-form v-on:submit="addTask"></task-form>

    ...

    <task-form v-else v-on:submit="editTask" v-bind:task="t"></task-form>
    ```

# Step 6 - Add search functionality (a computed property). #
1. Add search value to code.js
    ```javascript
    searchValue: null
    ```
2. Add search function to code.js
    ```javascript
    computed: {
        filteredTasks: function() {
            var self = this

            if (!self.searchValue) {
                return self.tasks;
            }

            return self.tasks.filter(function(value) {
                return value.task.toLowerCase().includes(self.searchValue.toLowerCase());
            });
        }
    }
    ```
3. Add search text box to index.html
    ```html
    <input type="text" placeholder="Search..." v-model="searchValue">
    <hr>
    ```
4. Change list to use new computed property.
    ```html
    <li v-for="(t, i) in filteredTasks" v-bind:key="t.id">
    ```

# Step 7 - Add Due Date functionality #
1. Add date due to copy function in api.js
    ```javascript
    target.dateDue = source.dateDue;
    ```
2. Add date picker component to code.js
    ```javascript
    Vue.component('datePicker', {
        props: {
        value: [String]
        },
        data: function () {
        var self = this;
    
        return {
            date: self.value
        };
        },
        methods: {
        formatValueForPlugin: function (date) {
            if (date === null) {
            return null;
            }

            date = new Date(date);
            return date.toLocaleDateString();
        },
        handleChange: function (value) {
            var self = this;
            self.$emit('input', value);
            self.$emit('change', value);
        },
        setValue: function () {
            this.date = this.value;
        }
        },
        watch: {
        value: function () {
            var self = this;
            self.setValue();
        },
        date: function (){
            this.handleChange(this.date);
        }
        },
        mounted: function () {
        },
        template: '<b-form-input id="dateDueForm" type="date" size="sm" v-model="date" />'
    });
    ```
3. Add due date to taskFormComponent data in code.js
    ```javascript
    dateDue: self.task ? self.task.dateDue : new Date().toLocaleDateString()
    ```
4. Update handleSubmit method to add date due  in code.js
    ```javascript
    self.$emit('submit', {
        task: self.taskText,
        dateDue: self.dateDue
      });
    ```
5. Update addTask and editTask in code.js to convert from text to formdata.
    ```javascript
    task: formData.task,
    dateDue: formData.dateDue
    ```
6. Add style sheets to index.html
    ```html
        <link type="text/css" rel="stylesheet" href="http://unpkg.com/bootstrap/dist/css/bootstrap.min.css" />
    <link
      type="text/css"
      rel="stylesheet"
      href="http://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.css"
    />
    ```
7. Add new date picker to task-form-template in index.html
    ```html
    <date-picker v-model="dateDue" />
    ```
8. Add javscript files.
    ```html
    <script src="http://unpkg.com/@babel/polyfill@latest/dist/polyfill.js" type="text/javascript"></script>
    <script src="https://unpkg.com/vue@2.6.9" type="text/javascript"></script>
    <script src="http://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js" type="text/javascript"></script>
    ```

# Step 8 - Add the ability to complete the task. With loading and no items text. #

# Step 9 - Create the task item component. #
