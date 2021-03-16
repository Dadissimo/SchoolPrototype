import React from 'react';
import applyVerticalAlignment from '../utility/applyVerticalAlignment';
import html2Pdf from 'html2pdf.js';

import Plot from '../logic/Plot';

console.log(html2Pdf);
const Report = ({data, selected}) => {
    const ref = React.useRef();

    if (!data) return <button disabled className="btn btn-success mt-1">{'Generate Trimester Report'}</button>;

    data = data[selected.trimester];

    const handleClick = () => {
        const {classes, metaData} = data;
        if (!classes) return null;

        classes.forEach(currentClass => {

            // const contents = generateContents(currentClass.students, metaData);
            // const docDefinition = generateDocDefinition(contents);
            // pdfMake.createPdf(docDefinition).download(metaData.trimester + ' Trimester ' + metaData.level + currentClass.name + '.pdf');

            var opt = {
                filename:     'myfile.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 4 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
              };
        
            html2Pdf().set(opt).from(ref.current).save()
        })
    }

    return (
        <button ref={ ref } className="btn btn-success mt-1" onClick={ handleClick }>{'Generate Report(s) For Trimester ' + (selected.trimester + 1)}</button>
    );
}

const generateDocDefinition = content => {
    return {
        pageOrientation: 'landscape',
        content,
        styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                table: {
                    margin: [0, 5, 0, 15]
                }
        }
    };
}

const generateContents = (students, metaData) => {
    return students.map((student, i) => {
        const noBreak = i === 0;
        return generateReportForStudent(student, metaData, noBreak);
    })
}

const generateReportForStudent = (student, metaData, noBreak = false) => {
    // const assignments = ['Assignments'].concat(
    //     student.topics.map(topic => {
    //         return {
    //             image: writeRotatedText(topic.name),
    //             fit: [20, 240],
    //             alignment: 'left'
    //         }
    //     })
    // ).concat({text: 'Ø', alignment: 'center'});
    const assignments = ['Assignments'].concat(
            student.topics.map(topic => topic.name)
        ).concat({text: 'Ø', alignment: 'center'});

    const execution = ['Ausführung'].concat(
        student.topics.map(topic => topic.grade.assignmentGrade)
    ).concat(student.avarage.assignmentGrade);
    
    const stars = ['Sterne'].concat(
        student.topics.map(topic => convertToStars(topic.grade.difficulty))
    ).concat(student.avarage.difficulty);

    const score = ['Prüfung in %'].concat(
        student.topics.map(topic => ({text: topic.grade.testScore, fillColor: getFillColor(topic.grade.testScore)}))
    ).concat({text: student.avarage.testScore, fillColor: getFillColor(student.avarage.testScore)});

    const plot = Plot.createSVG(student);

    const content = [
        {
            pageBreak: noBreak ? undefined : 'before',
            table: {
                headerRows: 1,
                widths: ['*', 200],
                body: [
                    [
                        {text: 'Leistungsnachweis ' + metaData.subject, style: 'header', fillColor: '#eeeeee'}, 
                        {text: metaData.trimester + ' Trimester ' + metaData.year, style: 'header', fillColor: '#eeeeee', alignment: 'right'}
                    ]
                ]
            },
            layout: 'lightHorizontalLines',
            style: 'table'
        },
        {text: 'Name: ' + student.name},
        {
            style: 'table',
            table: {
                body: [
                    assignments,
                    execution,
                    stars,
                    score
                ]
            },
            layout: { paddingTop: function (index, node) {
                if(index === 0) applyVerticalAlignment(node, index, 'bottom');
                return 0;
            }, },
        },
        {
            svg: plot,
            alignment: 'center'
        }
    ];

    return content;
}

function convertToStars(value) {
    if (isSpecialRemark(value)) return value;
    let str = '';
    for (let index = 0; index < value; index++) {
        str += '*';                
    }
    return str;
}

function isSpecialRemark(value) {
    if (value === 'f' || value === 'k') return true;
    return false;
}

function getFillColor(percentage) {
    const colors = ["#32a852", "#32a852", "#34a751", "#35a651", "#37a550", "#38a350", "#3aa24f", "#3ba14f", "#3da04e", "#3e9f4e", "#409e4d", "#419d4d", "#439b4c", "#449a4c", "#46994b", "#47984b", "#49974a", "#4a964a", "#4c9549", "#4d9349", "#4f9248", "#509147", "#529047", "#538f46", "#558e46", "#568d45", "#588b45", "#598a44", "#5b8944", "#5c8843", "#5e8743", "#5f8642", "#618542", "#628341", "#648241", "#658140", "#678040", "#687f3f", "#6a7e3f", "#6b7d3e", "#6d7b3e", "#6e7a3d", "#70793c", "#71783c", "#73773b", "#74763b", "#76753a", "#77733a", "#797239", "#7a7139", "#7c7038", "#7d6f38", "#7f6e37", "#806d37", "#826c36", "#836a36", "#856935", "#866835", "#886734", "#896634", "#8b6533", "#8c6432", "#8e6232", "#8f6131", "#916031", "#925f30", "#945e30", "#955d2f", "#975c2f", "#985a2e", "#9a592e", "#9b582d", "#9d572d", "#9e562c", "#a0552c", "#a1542b", "#a3522b", "#a4512a", "#a6502a", "#a74f29", "#a94e29", "#aa4d28", "#ac4c27", "#ad4a27", "#af4926", "#b04826", "#b24725", "#b34625", "#b54524", "#b64424", "#b84223", "#b94123", "#bb4022", "#bc3f22", "#be3e21", "#bf3d21", "#c13c20", "#c23a20", "#c4391f", "#c5381f", "#c7371e"];
    return colors[100 - Math.round(percentage)];
}

// function writeRotatedText(text, config = {}) {
//     const {font = '20pt Arial', rotate = -0.5 * Math.PI} = config;
//     let ctx;
//     const canvas = document.createElement('canvas');
//     canvas.width = 50;
//     canvas.height = 300;
//     ctx = canvas.getContext('2d');
//     ctx.font =  font;
//     ctx.save();
//     ctx.translate(50, 300);
//     ctx.rotate(rotate);
//     ctx.fillStyle = '#000';
//     ctx.fillText(text, 0, 0);
//     ctx.restore();
//     return canvas.toDataURL();
// };

export default Report;