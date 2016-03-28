define([
    'chai',
    'tests/utils',
    'jquery',
], function (
    chai,
    util,
    $
) {
    var assert = chai.assert;

    describe("The undo manager", function () {
        beforeEach(function(done) {
            util.init({
                javaRosa: {langs: ['en']},
                core: { onReady: done },
                features: {rich_text: false},
            });
        });

        it("should show an alert when deleting questions", function () {
            util.addQuestion('Text', 'text');
            $('.fd-button-remove').click();
            assert($('.fd-undo-delete').length);
        });

        it("should undelete one question properly", function () {
            util.addQuestion('Text', 'text');
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('text');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('text');
            assert(true, "Woo! text restored");
        });

        it("should undelete two questions properly", function () {
            util.addQuestion('Text', 'text');
            util.addQuestion('Text', 'text2');
            util.clickQuestion('text', 'text2');
            util.assertJSTreeState("text", "text2");
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('text');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('text');
            util.assertJSTreeState("text", "text2");
        });

        it("should undelete a nested question properly", function () {
            util.addQuestion('Group', 'group');
            util.addQuestion('Text', 'text2');
            util.assertJSTreeState("group", "  text2");
            util.clickQuestion('group/text2');
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('text2');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('group/text2');
            util.assertJSTreeState("group", "  text2");
        });

        it("should undelete a group properly", function () {
            util.addQuestion('Group', 'group');
            util.addQuestion('Text', 'text2');
            util.assertJSTreeState("group", "  text2");
            util.clickQuestion('group');
            $('.fd-button-remove').click();
            util.assertJSTreeState();
            try {
                util.clickQuestion('text2');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('group/text2');
            util.assertJSTreeState("group", "  text2");
        });

        it("should undelete a nested group properly", function () {
            util.addQuestion('Group', 'group');
            util.addQuestion('Group', 'group2');
            util.addQuestion('Text', 'text2');
            util.assertJSTreeState("group", "  group2", "    text2");
            util.clickQuestion('group/group2');
            $('.fd-button-remove').click();
            util.assertJSTreeState("group");
            try {
                util.clickQuestion('group2');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('group/group2/text2');
            util.assertJSTreeState("group", "  group2", "    text2");
        });

        it("should undelete a question with question after it", function () {
            util.addQuestion('Text', 'text');
            util.addQuestion('Text', 'text2');
            util.clickQuestion('text');
            util.assertJSTreeState("text", "text2");
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('text');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('text');
            util.assertJSTreeState("text", "text2");
        });

        it("should undelete the first question", function () {
            util.addQuestion('Text', 'text');
            util.clickQuestion('text');
            util.assertJSTreeState("text");
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('text');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            assert(!$('.fd-default-panel').is(':visible'), "New Form dialog showing");
            util.assertJSTreeState("text");
        });

        it("should undelete a multiple choice question with correct number of children", function () {
            util.addQuestion('Select', 'select');
            util.clickQuestion('select');
            util.assertJSTreeState("select", "  choice1", "  choice2");
            $('.fd-button-remove').click();
            try {
                util.clickQuestion('select');
                assert(false, "this better not work");
            } catch (err) {
                assert(true, "text doesn't exist");
            }
            $('.fd-undo').click();
            util.clickQuestion('select');
            util.assertJSTreeState("select", "  choice1", "  choice2");
        });

        it("should undelete multiple questions when selected out of order", function () {
            util.addQuestion('Text', 'text');
            util.addQuestion('Text', 'text2');
            util.addQuestion('Text', 'text3');
            util.clickQuestion('text3', 'text2');
            util.assertJSTreeState("text", "text2", "text3");
            $('.fd-button-remove').click();
            util.assertJSTreeState("text");
            $('.fd-undo').click();
            util.assertJSTreeState("text", "text2", "text3");
        });
    });
});
