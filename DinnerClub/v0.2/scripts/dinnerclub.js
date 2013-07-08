define(['rests', 'questions', 'story', 'view', 'history'], function (rests, questions, story, view, history) {

    //TODO - flight to SF

    /* TODO list
     *
     * - html5shiv
     * - media queries shiv\polyfill
     * - cookie (results)
     * - i18n\l10n
     * - media queries (+determine resolutions)
     * - results view
     * - no rests left view
     */

    function log() {
        var args = [].slice.apply(arguments);
        args.unshift("[DinnerClub]");

        console.log.apply(console, args);
    }


    var userSelection,
        restList,
        questionsList,
        currentQuestionIndex;


    /**
     * Filter restaurants according to user selection and continue to next question
     *
     * @param {string} vertical current question's assigned vertical
     * @param {string} answer user's selection in the current vertical
     */
    function onUserSelection(vertical, answer) {
        history.save(
            currentQuestionIndex,
            restList,
            userSelection
        );

        // no answer yet for the current vertical, continue on to next question
        // this happens when the vertical is split into multiple questions,
        // like in the party vertical (Date\So)
        if (answer == "") {
            nextQuestion();
            updateView();
            return;
        }


        // filter rest-list
        var currentFilter = {};
        currentFilter[vertical] = userSelection[vertical] = answer;
        restList = rests.filter(currentFilter, restList);


        if (!(restList.length)) {
            noRestsLeft();
            return;
        }

        nextQuestion();
        updateView(story[vertical][answer]);
    }


    /**
     * Return to the previous question and re-apply previous state
     */
    function onBack() {
        if (currentQuestionIndex == 0) return; // already on first question

        var state = history.restore();
        if (!state) return; // no available history

        currentQuestionIndex = state.currentQuestionIndex;
        restList = state.restList;
        userSelection = state.userSelection;

        view.removeStoryChapter();
        updateView();
    }


    /**
     * Alert the user that no restaurants match their current selection
     */
    function noRestsLeft() {
        view.noRestsLeft();
    }


    /**
     * Update the view with the relevant question, rest count and story
     *
     * @param {String=} story New story snippet to display.
     */
    function updateView(story) {
        log("updateView", 'currentQuestionIndex:', currentQuestionIndex, "userSelection:", userSelection ,"restList:", restList);



        if (currentQuestionIndex == questionsList.length) {
            view.displayResults(restList);
        } else {
            view.displayQuestion(questionsList[currentQuestionIndex].id);
        }

        view.updateRestCount(restList.length);
        if (story) {
            view.addStoryChapter(story);
        }
    }


    /**
     * Continue to the next question.
     * If a question's assigned vertical has already been selected by the user, it will be skipped
     */
    function nextQuestion() {
        while (questionsList[++currentQuestionIndex] && userSelection[questionsList[currentQuestionIndex].vertical]) {
        }
    }


    /**
     * Reset all current indices,modules & user selections,
     * start over with fresh lists, and reset the view
     */
    function reset() {
        currentQuestionIndex = 0;
        userSelection = {};
        restList = rests.fetch();

        history.reset();

        view.removeStoryChapter(true);
        updateView();
    }


    /**
     * Do the init, yes?
     */
    function init() {
        questionsList = questions.fetch();
        view.init(this, questionsList);

        reset();
    }


    return {
        init:init,
        onUserSelection:onUserSelection,
        onBack: onBack,
        onReset: reset
    };

});