define([
    'tests/utils',
    'chai',
    'jquery',
    'underscore',
    'vellum/saveToCase',
    'text!static/saveToCase/create_property.xml',
    'text!static/saveToCase/close_property.xml',
    'text!static/saveToCase/update_property.xml',
    'text!static/saveToCase/index_property.xml',
    'text!static/saveToCase/create_2_property.xml',
], function (
    util,
    chai,
    $,
    _,
    saveToCase,
    CREATE_PROPERTY_XML,
    CLOSE_PROPERTY_XML,
    UPDATE_PROPERTY_XML,
    INDEX_PROPERTY_XML,
    CREATE_2_PROPERTY_XML
) {
    var assert = chai.assert,
        call = util.call;

    describe("The SaveToCase module", function() {
        before(function (done) {
            util.init({
                javaRosa: {langs: ['en']},
                core: {onReady: done}
            });
        });

        it("should load and save a create property", function () {
            util.loadXML(CREATE_PROPERTY_XML);
            var create = util.getMug("save_to_case"),
                props = create.p.create_property;
            assert.equal(props.case_type.calculate, "caseType");
            assert.equal(props.case_name.calculate, "/data/name");
            assert.equal(create.p.use_create, true);
            assert.equal(props.owner_id.calculate, '/data/meta/userID');
            assert.equal(create.p.date_modified, '/data/meta/timeEnd');
            assert.equal(create.p.user_id, "/data/meta/userID");
            util.assertXmlEqual(call("createXML"), CREATE_PROPERTY_XML);
        });

        it("should load and save a close property", function () {
            util.loadXML(CLOSE_PROPERTY_XML);
            var close = util.getMug("save_to_case");
            assert.equal(close.p.use_close, true);
            assert.equal(close.p.close_condition, "1=1");
            assert.equal(close.p.date_modified, '/data/meta/timeEnd');
            assert.equal(close.p.user_id, "/data/meta/userID");
            assert.equal(close.p.case_id, "/data/meta/caseID");
            util.assertXmlEqual(call("createXML"), CLOSE_PROPERTY_XML);
        });

        it("should load and save a update property", function () {
            util.loadXML(UPDATE_PROPERTY_XML);
            var update = util.getMug("save_to_case");
            assert.equal(update.p.use_update, true);
            assert(_.isEqual(update.p.update_property, {
                name: {
                    relevant: "/data/name != ''",
                    calculate: "/data/name"
                }
            }));
            assert.equal(update.p.date_modified, '/data/meta/timeEnd');
            assert.equal(update.p.user_id, "/data/meta/userID");
            assert.equal(update.p.case_id, "/data/meta/caseID");
            util.assertXmlEqual(call("createXML"), UPDATE_PROPERTY_XML);
        });

        it("should load and save a index property", function () {
            util.loadXML(INDEX_PROPERTY_XML);
            var index = util.getMug("save_to_case");
            assert.equal(index.p.use_index, true);
            assert(_.isEqual(index.p.index_property, {
                extension: {
                    calculate: "/data/meta/caseID",
                    case_type: "extension_case",
                    relationship: "extension",
                }
            }));
            assert.equal(index.p.date_modified, '/data/meta/timeEnd');
            assert.equal(index.p.user_id, "/data/meta/userID");
            assert.equal(index.p.case_id, "/data/meta/caseID");
            util.assertXmlEqual(call("createXML"), INDEX_PROPERTY_XML);
        });

        it("should load 2 create setvalues", function () {
            util.loadXML(CREATE_2_PROPERTY_XML);
            var create1 = util.getMug("create1"),
                create2 = util.getMug("create2");
            assert.equal(create1.p.case_id, "1");
            assert.equal(create2.p.case_id, "2");
            util.assertXmlEqual(call("createXML"), CREATE_2_PROPERTY_XML);
        });

        it("should load and save a index property", function () {
            util.loadXML(INDEX_PROPERTY_XML);
            util.clickQuestion("save_to_case");
            $('#fd-question-edit-update').find('.fd-add-property').click();
            util.assertXmlEqual(call("createXML"), INDEX_PROPERTY_XML);
        });
    });
});