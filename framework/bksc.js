const cheerio = require("cheerio");
const fs = require("fs");
const { convert } = require('html-to-text');
const axios = require("axios");
axios.defaults.baseURL = 'http://bksc.ac.th/club/';

const substring_between = (str, str1, str2) => str.split(str1).pop().split(str2)[0];

module.exports.getclubs = async () => {
    let res = await axios.get("list_club.php")
    const $ = cheerio.load(res.data);
    let clubs = []

    for (let [index, element] of Object.entries($("body > table > tbody > tr").each((index, element) => { }))) {
        if (index == 0) continue;
        let getHtml = (index) => ($($(element).find("td")[index])).html() || ""
        let id = parseInt((getHtml(4).split('<a href="member.php?id_c=')[1] || "").split('"')[0] || 0)
        if (id == 0) continue;
        const field_2_full = getHtml(1)
        const back_of_field_2 = substring_between(field_2_full, '<br>', ')')
        const name = substring_between(field_2_full, '&nbsp;', '<br>');
        const permission = back_of_field_2.includes('ม.4') ? 'ONLY_SENIOR' : back_of_field_2.includes('ม.1') ? 'ONLY_JUNIOR' : "EVERYONE"
        const teacher = convert(getHtml(2)).trim()
        const memberCount = Number(substring_between(getHtml(4), '">', '<br'))
        const maxMember = Number(getHtml(3))
        clubs.push({
            id,
            name,
            permission,
            teacher,
            memberCount,
            maxMember
        });
    }
    // clubs.sort((a, b) => a.id - b.id);
    return clubs
}

module.exports.getclub = async (clubId = 0) => {
    const res = await axios.get("member.php?id_c=" + clubId)
    const $ = cheerio.load(res.data);
    let getHtml = (index, type) => ($($('body > div.w3-main > div > div.w3-container > div > div > div').find(type || "h3")[index])).html() || ""
    let name = convert(substring_between(getHtml(0), ': ', '</h3')).trim() || null
    let teacher = convert(substring_between(getHtml(1), ': ', '</h3')).trim() || null
    let maxmin_member = convert(substring_between(getHtml(1, 'h4'), ': ', '</h4')).trim().split("/")
    let getMemberIndex = (element, index) => $($(element).find("td")[index]).text()
    let members = []
    const permission = res.data.includes('รับเฉพาะนักเรียนชั้น ม.4 - ม.6') ? 'ONLY_SENIOR' : res.data.includes('รับเฉพาะนักเรียนชั้น ม.1 - ม.3') ? 'ONLY_JUNIOR' : "EVERYONE"

    $("body > div.w3-main > div > div.w3-container > div > div > center > table > tbody > tr").each((index, element) => {
        if (index == 0) return;
        const name = convert(getMemberIndex(element, 1))
        members.push({
            name: name,
            room: convert(getMemberIndex(element, 2)),
            gender: ['นาย', 'เด็กชาย'].some(_ => name.includes(_)) ? 'male' : 'female'
        })
    });

    return {
        id: clubId,
        name: name,
        teacher,
        permission,
        maxMember: Number(maxmin_member[0]),
        memberCount: Number(maxmin_member[1]),
        members
    }
}

// (async() => {
//     console.log(await module.exports.getclub(1));
// })()

module.exports.getstudent = async (studentId = 0) => {
    // const students = require('../students.json')
    // const find = students.find(_ => _.id == studentId)
    // if (find) return find
    const res = await axios.post("search_id.php", "id_std=" + studentId)
    const $ = cheerio.load(res.data);
    let getHtml = (index) => ($($('body > div.w3-main > div > form > div').find("h3")[index])).html() || ""
    let name = convert(substring_between(getHtml(1), ': ', '</h3')).trim() || null

    let room = convert(substring_between(getHtml(2), ': ', '</h3'))
    let club = convert(substring_between(getHtml(3), ': ', '</h3'))
    club = club.includes('ยังไม่ลง') ? null : club
    let club_teacher = convert(substring_between(getHtml(4), ': ', '</h3'))
    club_teacher = club_teacher.includes('-') ? null : club_teacher
    const raw = {
        id: studentId,
        name,
        room,
        club,
        club_teacher
    }

    // students.push(raw)
    // fs.writeFileSync('../students.json', JSON.stringify(students));

    return raw
}

module.exports.joinclub = async (clubId = 0, studentId = 0) => {
    return await axios.post("http://bksc.ac.th/club/confirm_reg.php", "id_std=" + studentId + "&id_c=" + clubId)
}