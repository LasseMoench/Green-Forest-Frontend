// Define the math-task component
Vue.component('math-task', {
template: `
    <div class="math-task">
        <div class="content-wrapper">
            <div class="equation-wrapper">
            <h2>Solve the Equation: {{ equation }}</h2>
            <input type="number" v-model="userAnswer" @keyup.enter="checkAnswer"/>
            <button @click="checkAnswer">Submit</button>
            </div>
            <div class="checkmark-wrapper">
              <img src="img/happy_squirrel.png" v-if="showCheckMark">
              <img src="img/sad_squirrel.png" v-else-if="showSad">
              <img src="img/thinking_squirrel.png" v-else>
            </div>
            <div class="timer-bar-container">
                <div class="timer-bar" :style="{ width: timerWidth + '%' }"></div>
            </div>
            <p>Hazelnuts: {{ hazelnuts }}</p>
        </div>
    </div>
`,

    data() {
        return {
            equation: '', // Example equation, this can be dynamically generated
            userAnswer: '',
            timeLeft: 30, // Timer duration in seconds
            timer: null,
            hazelnuts: 0,
            showCheckMark: false,
            showSad: false,
        };
    },
    created() {
        console.log("Starting connection to WebSocket Server")
        this.connection = new WebSocket("ws://localhost:8123")

        this.connection.onmessage = function(event) {
            console.log("Received message from the server")
            console.log(event);
        }

        this.connection.onopen = function(event) {
            console.log(event)
            console.log("Successfully connected to the echo websocket server...")
        }

    },
    mounted() {
        this.generateEquation();
        this.startTimer();
    },
    computed: {
    timerWidth() {
        return (this.timeLeft / 30) * 100; // Assuming 30 seconds is the total time
    }
},
methods: {
    generateEquation() {
        let x;
        let b;
        let m = 0;
        if(this.hazelnuts >= 100) {
            m = Math.floor(Math.random() * 9) + 1;
            x = Math.floor(Math.random() * 20); // Random number between 0 and 9
            b = Math.floor(Math.random() * 100) - 50; // Random number between 0 and 9
            if (b < 0) {
                this.equation = `${m}x - ${Math.abs(b)} = ${m * x + b}`;
            } else {
                this.equation = `${m}x + ${b} = ${m * x + b}`;
            }
            this.correctAnswer = x;
        } else if (this.hazelnuts >= 50) {
            // Number may be negative
            x = Math.floor(Math.random() * 40) - 20; // Random number between 0 and 9
            b = Math.floor(Math.random() * 40) - 20; // Random number between 0 and 9
            if (b < 0) {
                this.equation = `x - ${Math.abs(b)} = ${x + b}`;
            } else {
                this.equation = `x + ${b} = ${x + b}`;
            }
            this.correctAnswer = x;
        } else {
            x = Math.floor(Math.random() * 20); // Random number between 0 and 9
            b = Math.floor(Math.random() * 20); // Random number between 0 and 9
            this.equation = `x + ${b} = ${x + b}`;
            this.correctAnswer = x;
        }
    },
    checkAnswer() {
        clearInterval(this.timer);
        if (parseInt(this.userAnswer) === this.correctAnswer) {
            this.hazelnuts += 10;
            this.showCheckMark = true; // Show the check mark
            setTimeout(() => {
                this.showCheckMark = false; // Hide the check mark after 1 second
                this.generateEquation(); // Generate a new equation
                this.resetTimer(); // Reset the timer for the new question
            }, 2000);
        } else {
            this.hazelnuts -= 10;
            this.showSad = true;
            setTimeout(() => {
                this.showSad = false; // Hide the check mark after 1 second
                this.generateEquation(); // Generate a new equation
                this.resetTimer(); // Reset the timer for the new question
            }, 2000);

        }
        this.userAnswer = ''; // Clear the user answer
    },
    handleTimeOut() {
        clearInterval(this.timer);
        this.hazelnuts -= 5; // Decrease score by 5 when timer expires
        alert('Time is up! You lost 5 hazelnuts.');
        // Handle the timeout event, like showing the correct answer or moving to the next question
        this.generateEquation(); // Generate a new equation
        this.resetTimer();
    },
    startTimer() {
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft -= 1;
            } else {
                this.handleTimeOut();
            }
        }, 1000);
    },
    resetTimer() {
        clearInterval(this.timer); // Clear the existing timer
        this.timeLeft = 30; // Reset the time left to the initial value
        this.startTimer(); // Start a new timer
    },
},

    beforeDestroy() {
        clearInterval(this.timer); // Clear the timer when the component is destroyed
    }
});
