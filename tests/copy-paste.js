require([
    'chai',
    'jquery',
    'underscore',
    'tests/utils',
    'text!static/copy-paste/many-itext-forms.xml',
    'text!static/copy-paste/text-question.xml',
    'vellum/copy-paste',
    'vellum/tsv'
], function (
    chai,
    $,
    _,
    util,
    MANY_ITEXT_FORMS_XML,
    TEXT_QUESTION_XML,
    mod,
    tsv
) {
    var assert = chai.assert,
        call = util.call;

    function eq(serial, rows, message) {
        util.assertEqual(serial + "\n", rows + "\n", message);
    }

    describe("The copy-paste plugin", function () {
        before(function (done) {
            util.init({
                javaRosa: { langs: ['en', 'hin'] },
                core: {
                    onReady: function () {
                        assert(this.isPluginEnabled("copyPaste"),
                               "copyPaste plugin should be enabled");
                        done();
                    }
                }
            });
        });

        _.each([
            {
                message: "a text question",
                xml: TEXT_QUESTION_XML,
                serial: tsv.tabDelimit([
                    ["vellum copy/paste", "version 1"],
                    [
                        "id",
                        "type",
                        "labelItext:en-default",
                        "labelItext:hin-default",
                        "constraintMsgItext:en-default",
                        "constraintMsgItext:hin-default",
                        "constraintAttr",
                        "relevantAttr",
                        "requiredAttr",
                    ], [
                        "/txt",
                        "Text",
                        "English Text",
                        "Hindi Text",
                        "Nope",
                        "Nope",
                        "1 = 0",
                        "x = y",
                        "true",
                    ],
                ]),
            }, {
                message: "a question with many itext forms",
                xml: MANY_ITEXT_FORMS_XML,
                serial: tsv.tabDelimit([
                    ["vellum copy/paste", "version 1"],
                    [
                        "id",
                        "type",
                        "labelItext:en-default",
                        "labelItext:hin-default",
                        "labelItext:en-audio",
                        "labelItext:hin-audio",
                        "labelItext:en-custom",
                        "labelItext:hin-custom",
                        "labelItext:en-image",
                        "labelItext:hin-image",
                        "labelItext:en-long",
                        "labelItext:hin-long",
                        "labelItext:en-short",
                        "labelItext:hin-short",
                        "labelItext:en-video",
                        "labelItext:hin-video",
                        "labelItext",
                        "constraintMsgItext:en-default",
                        "constraintMsgItext:hin-default",
                        "helpItext:en-default",
                        "helpItext:hin-default",
                        "helpItext:en-audio",
                        "helpItext:hin-audio",
                        "helpItext:en-image",
                        "helpItext:hin-image",
                        "helpItext:en-video",
                        "helpItext:hin-video",
                        "helpItext",
                        "hintItext:en-default",
                        "hintItext:hin-default",
                        "hintItext",
                        "constraintAttr",
                        "hintLabel",
                    ], [
                        "/text",
                        "Text",
                        "default",
                        "default",
                        "jr://file/commcare/audio/data/text.mp3",
                        "jr://file/commcare/audio/data/text.mp3",
                        "custom",
                        "custom",
                        "jr://file/commcare/image/data/text.png",
                        "jr://file/commcare/image/data/text.png",
                        "long",
                        "long",
                        "short",
                        "short",
                        "jr://file/commcare/video/data/text.3gp",
                        "jr://file/commcare/video/data/text.3gp",
                        "default-label",
                        "valid",
                        "valid",
                        "help",
                        "help",
                        "jr://file/commcare/audio/help/data/text.mp3",
                        "jr://file/commcare/audio/help/data/text.mp3",
                        "jr://file/commcare/image/help/data/text.png",
                        "jr://file/commcare/image/help/data/text.png",
                        "jr://file/commcare/video/help/data/text.3gp",
                        "jr://file/commcare/video/help/data/text.3gp",
                        "default-help",
                        "hint",
                        "hint",
                        "default-hint",
                        "1 = 0",
                        "",
                    ],
                ]),
            }
        ], function (item) {
            it("should copy " + item.message, function () {
                util.loadXML(item.xml);
                eq(mod.copy(), item.serial);
            });

            it("should paste " + item.message, function () {
                util.loadXML("");
                assert.deepEqual(mod.paste(item.serial), []);
                util.assertXmlEqual(call("createXML"), item.xml, {normalize_xmlns: true});
            });
        });

        // TODO allow mutliple selection in tree
        // TODO test each mug spec item (don't forget exotic/plugin question types)
        // TODO test bad paste values
        // TODO insert question with same nodeID
        // TODO find a case where, when copying multiple questions, one
        //      ends up with a null value on a property that it did not
        //      return from mug.serialize(), and should not be passed
        //      to mug.deserialize().
        //      ALSO maybe find the converse: property serializes to null
        //      but that null value must be passed to mug.deserialize()
        //      (seems less likely that this is a thing)
    });

    describe("The copy-paste string conversions should", function () {
        function test(value, string) {
            var json = JSON.stringify(value),
                jstr = JSON.stringify(string);

            it("stringify(" + json + ") -> " + jstr, function () {
                assert.deepEqual(mod.stringify(value), string);
            });

            it(" valuify(" + jstr + ") -> " + json, function () {
                assert.deepEqual(mod.valuify(string), value);
            });
        }

        // primitives
        test(null, 'null');
        test(true, 'true');
        test(false, 'false');
        test("null", '"null"');
        test("true", '"true"');
        test("false", '"false"');

        // JSON-like values
        test([], '[]');
        test({}, '{}');
        test('', '');
        test('x', 'x');
        test('"', '"');
        test('[\n]', '"[\\n]"');
        test("{\n}", '"{\\n}"');
        test('"\n"', '"\\"\\n\\""');

        // numbers
        test(0, '0');
        test(1, '1');
        test(350, '350');
        test(0.5, '0.5');
        test(-1.2e-10, '-1.2e-10');
        test("0", '"0"');
        test("1", '"1"');
        test("350", '"350"');
        test("0.5", '"0.5"');
        test("-1.2e-10", '"-1.2e-10"');

        // edge cases
        (function (undefined) {
            // is this what we want? does it matter?
            test(undefined, undefined);
        })();
        test("{1} ", "{1} ");
        test("{1} {2}", '"{1} {2}"');
        test("[1] [2]", '"[1] [2]"');
        test("01", '"01"');
    });
});
