/*	This contains the course data*/
var fileData = [{
    data: [{
        source: "https://filetransfer.lrn.com/seema/CMP001-s10en.zip",
        thumbNail: "images/app/banner-1.jpg",
        id: '1',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns.",
        courseType: 'optional',
        moduleId: '1200',
        language: 'en',
        title: 'CMP001-s10en',
        mediaType: false

    }, {
        source: "https://filetransfer.lrn.com/seema/ZQA122-a72en.zip",
        thumbNail: "images/app/banner-2.jpg",
        id: '2',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns.",
        courseType: 'optional',
        moduleId: '1201',
        language: 'en',
        title: 'ZQA122-a72en',
        mediaType: true
    }, {
        source: "http://scorm.com/wp-content/assets/golf_examples/PIFS/AllGolfExamples.zip",
        thumbNail: "images/app/banner-3.jpg",
        id: '3',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns. ",
        courseType: 'mandatory',
        moduleId: '1202',
        language: 'en',
        title: 'AllGolfExamples',
        mediaType: true

    }, {
        source: "http://scorm.com/wp-content/assets/golf_examples/PIFS/ContentPackagingSingleSCO_SCORM20043rdEdition.zip",
        thumbNail: "images/app/banner-4.jpg",
        id: '4',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns. ",
        courseType: 'mandatory',
        moduleId: '1203',
        language: 'en',
        title: 'ContentPackagingSingleSCO_SCORM20043rdEdition',
        mediaType: true

    }, {
        source: "https://filetransfer.lrn.com/seema/CMP001-s10en-SCORM.zip",
        thumbNail: "images/app/banner-1.jpg",
        id: '5',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns. ",
        courseType: 'mandatory',
        moduleId: '1204',
        language: 'en',
        title: 'CMP001-s10en-SCORM',
        mediaType: true
    }, {
        source: "https://filetransfer.lrn.com/seema/ZQA122-a72en-SCORM_WoFlash.zip",
        thumbNail: "images/app/banner-3.jpg",
        id: '6',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns. ",
        courseType: 'optional',
        moduleId: '1205',
        language: 'en',
        title: 'ZQA122-a72en-SCORM_WoFlash',
        mediaType: true
    }, {
        source: "https://s3.amazonaws.com/phonegap.download/phonegap-2.7.0.zip",
        thumbNail: "images/app/banner-3.jpg",
        id: '7',
        desc: "Promotional campaigns convey vital information about your company's products to healthcare professionals and consumers, both of whom rely on that information in deciding whether to prescribe or buy your company's products. The campaigns have the potential to create consumer safety concerns. ",
        courseType: 'optional',
        title: 'Resolver',
        moduleId: '1206',
        language: 'en',
        mediaType: false
    }]
    }];
/*Configure course types*/
var mandatory = "mandatory";
var optional = "optional";
var pdfPath = encodeURI('MobileAppWireframesv7.pdf');

/*Error Groups */
var customExceptions = [301, 302, 303, 304, 305, 306, 316, 317, 307, 308, 309, 310, 311, 312, 313, 314];
var fileManipulationExceptions = [307, 308, 309, 310, 311, 312, 313, 314];
var dummySymphonyScromObject = "{\"organizations\":{\"LRN\":{\"resumeallidentifier\":null,\"suspendedglobalobjectives\":null,\"statuses\":{},\"cmi\":{\"TEST\":{\"cmi._children\":{\"value\":\"core, suspend_data, launch_data, comments, objectives, student_data, student_preference, interactions\",\"setbysco\":false},\"cmi._version\":{\"value\":\"3.4\",\"setbysco\":false},\"cmi.core._children\":{\"value\":\"student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time\",\"setbysco\":false},\"cmi.core.student_id\":{\"value\":\"1\",\"setbysco\":false},\"cmi.core.student_name\":{\"value\":\"user\",\"setbysco\":false},\"cmi.core.lesson_location\":{\"value\":\"\",\"setbysco\":false},\"cmi.core.credit\":{\"value\":\"credit\",\"setbysco\":false},\"cmi.core.lesson_status\":{\"value\":\"incomplete\",\"setbysco\":true},\"cmi.core.entry\":{\"value\":\"ab-initio\",\"setbysco\":false},\"cmi.core.score._children\":{\"value\":\"raw, min, max\",\"setbysco\":false},\"cmi.core.score.raw\":{\"value\":\"\",\"setbysco\":false},\"cmi.core.score.max\":{\"value\":\"\",\"setbysco\":false},\"cmi.core.score.min\":{\"value\":\"\",\"setbysco\":false},\"cmi.core.total_time\":{\"value\":\"0000:00:00.00\",\"setbysco\":false},\"cmi.core.lesson_mode\":{\"value\":\"normal\",\"setbysco\":false},\"cmi.core.exit\":{\"value\":null,\"setbysco\":false},\"cmi.core.session_time\":{\"value\":\"0000:00:05\",\"setbysco\":true},\"cmi.suspend_data\":{\"value\":\"0.0,0.1,0.2,0.3,\",\"setbysco\":true},\"cmi.launch_data\":{\"value\":\"\",\"setbysco\":false},\"cmi.comments\":{\"value\":\"\",\"setbysco\":false},\"cmi.comments_from_lms\":{\"value\":\"\",\"setbysco\":false},\"cmi.evaluation.comments._count\":{\"value\":\"0\",\"setbysco\":false},\"cmi.evaluation.comments._children\":{\"value\":\"content, location, time\",\"setbysco\":false},\"cmi.objectives._children\":{\"value\":\"id, score, status\",\"setbysco\":false},\"cmi.objectives._count\":{\"value\":\"0\",\"setbysco\":false},\"cmi.student_data._children\":{\"value\":\"mastery_score, max_time_allowed, time_limit_action\",\"setbysco\":false},\"cmi.student_data.mastery_score\":{\"value\":\"90\",\"setbysco\":false},\"cmi.student_data.max_time_allowed\":{\"value\":\"\",\"setbysco\":false},\"cmi.student_data.time_limit_action\":{\"value\":\"continue,no message\",\"setbysco\":false},\"cmi.student_preference._children\":{\"value\":\"audio, language, speed, text\",\"setbysco\":false},\"cmi.student_preference.audio\":{\"value\":\"0\",\"setbysco\":false},\"cmi.student_preference.language\":{\"value\":\"\",\"setbysco\":false},\"cmi.student_preference.speed\":{\"value\":\"0\",\"setbysco\":false},\"cmi.student_preference.text\":{\"value\":\"0\",\"setbysco\":false},\"cmi.interactions._children\":{\"value\":\"id, objectives, time, type, correct_responses, weighting, student_response, result, latency\",\"setbysco\":false},\"cmi.interactions._count\":{\"value\":\"0\",\"setbysco\":false},\"nav.event\":{\"value\":\"\",\"setbysco\":false}}},\"adldata\":{}}},\"globalobjectives\":{}}";

