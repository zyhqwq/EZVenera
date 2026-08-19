/**
 * JM漫画 (JMComic) 图源插件
 *
 * 完全兼容原版 Venera 的图源格式（参见 venera-app/venera 的 doc/comic_source.md）：
 * - 基于 ComicSource 基类，使用 Comic / ComicDetails / Comment 等桥接对象
 * - 仅依赖 init.js 提供的全局 API（Network / Convert / ComicSource / Image 等）
 * - 同一份文件可直接用于原版 Venera 与 EZVenera
 *
 * 功能：搜索、分类浏览、热榜、详情（含评论区）、章节图片（含分段混淆图自动还原）、
 * 相关推荐、外链解析、API/图片域名刷新与故障切换。
 */

/** @type {import('./_venera_.js')} */

const JM_SECRET = '185Hcomic3PAPP7R'
const JM_APP_VERSION = '2.0.30'
const JM_UA = 'Mozilla/5.0 (Linux; Android 9; V1938CT Build/PQ3A.190705.11211812; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Safari/537.36'
const JM_API_DOMAINS = ['www.cdngwc.cc', 'www.cdngwc.net', 'www.cdngwc.club', 'www.cdnhjk.net', 'www.cdnutc.me']
const JM_IMAGE_DOMAINS = [
    'cdn-msp.jmapiproxy1.cc', 'cdn-msp.jmapiproxy2.cc', 'cdn-msp2.jmapiproxy2.cc', 'cdn-msp3.jmapiproxy2.cc',
    'cdn-msp.jmapiproxy3.cc', 'cdn-msp2.jmapiproxy3.cc', 'cdn-msp3.jmapiproxy3.cc',
    'cdn-msp.jmdanjonproxy.vip', 'cdn-msp2.jmdanjonproxy.vip', 'cdn-msp3.jmdanjonproxy.vip',
    'cdn-msp.jmapinodeudzn.net', 'cdn-msp3.jmapinodeudzn.net'
]
const JM_DOMAIN_REFRESH_URL = 'https://rup4a04-c02.tos-cn-hongkong.bytepluses.com/newsvr-2025.txt'
const JM_DOMAIN_SECRET = 'diosfjckwpqpdfjkvnqQjsik'
const JM_PAGE_SIZE = 80
const JM_SCRAMBLE_220980 = 220980
const JM_SCRAMBLE_268850 = 268850
const JM_SCRAMBLE_421926 = 421926

const JM_MAIN_TAGS = [
    ['0', '全部'],
    ['1', '禁漫汉化'],
    ['2', '汉化'],
    ['3', '同人'],
    ['4', '单本'],
    ['5', '短篇'],
    ['6', 'CG图集'],
    ['7', '3D'],
    ['8', 'Cosplay'],
    ['9', '官方汉化'],
    ['10', '长篇'],
    ['11', '欧美'],
    ['12', '原画集']
]

const AES_SBOX = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
])

const AES_RSBOX = new Uint8Array(256)
for (let i = 0; i < 256; i++) AES_RSBOX[AES_SBOX[i]] = i

function gfMul(a, b) {
    let r = 0
    while (b > 0) {
        if (b & 1) r ^= a
        const hi = a & 0x80
        a = (a << 1) & 0xff
        if (hi) a ^= 0x1b
        b >>= 1
    }
    return r
}

function aesExpandKey(key) {
    const nk = key.length / 4
    const nr = nk + 6
    const words = 4 * (nr + 1)
    const w = new Uint8Array(words * 4)
    w.set(key)
    let rcon = 1
    for (let i = nk; i < words; i++) {
        const t0 = w[(i - 1) * 4]
        const t1 = w[(i - 1) * 4 + 1]
        const t2 = w[(i - 1) * 4 + 2]
        const t3 = w[(i - 1) * 4 + 3]
        const base = (i - nk) * 4
        if (i % nk === 0) {
            const u0 = AES_SBOX[t1]
            const u1 = AES_SBOX[t2]
            const u2 = AES_SBOX[t3]
            const u3 = AES_SBOX[t0]
            w[i * 4] = (w[base] ^ u0 ^ rcon) & 0xff
            w[i * 4 + 1] = (w[base + 1] ^ u1) & 0xff
            w[i * 4 + 2] = (w[base + 2] ^ u2) & 0xff
            w[i * 4 + 3] = (w[base + 3] ^ u3) & 0xff
            rcon = gfMul(rcon, 2)
        } else if (nk > 6 && i % nk === 4) {
            w[i * 4] = (w[base] ^ AES_SBOX[t0]) & 0xff
            w[i * 4 + 1] = (w[base + 1] ^ AES_SBOX[t1]) & 0xff
            w[i * 4 + 2] = (w[base + 2] ^ AES_SBOX[t2]) & 0xff
            w[i * 4 + 3] = (w[base + 3] ^ AES_SBOX[t3]) & 0xff
        } else {
            w[i * 4] = (w[base] ^ t0) & 0xff
            w[i * 4 + 1] = (w[base + 1] ^ t1) & 0xff
            w[i * 4 + 2] = (w[base + 2] ^ t2) & 0xff
            w[i * 4 + 3] = (w[base + 3] ^ t3) & 0xff
        }
    }
    return w
}

function aesDecryptBlock(inp, w) {
    const nr = w.length / 16 - 1
    const s = new Uint8Array(16)
    s.set(inp)
    const addRoundKey = (offset) => {
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                s[4 * c + r] ^= w[offset + 4 * c + r]
            }
        }
    }
    const invShiftRows = () => {
        const t = new Uint8Array(16)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                t[4 * c + r] = s[4 * ((c + 4 - r) % 4) + r]
            }
        }
        s.set(t)
    }
    const invSubBytes = () => {
        for (let i = 0; i < 16; i++) s[i] = AES_RSBOX[s[i]]
    }
    const invMixColumns = () => {
        for (let c = 0; c < 4; c++) {
            const b0 = s[4 * c]
            const b1 = s[4 * c + 1]
            const b2 = s[4 * c + 2]
            const b3 = s[4 * c + 3]
            s[4 * c] = gfMul(b0, 14) ^ gfMul(b1, 11) ^ gfMul(b2, 13) ^ gfMul(b3, 9)
            s[4 * c + 1] = gfMul(b0, 9) ^ gfMul(b1, 14) ^ gfMul(b2, 11) ^ gfMul(b3, 13)
            s[4 * c + 2] = gfMul(b0, 13) ^ gfMul(b1, 9) ^ gfMul(b2, 14) ^ gfMul(b3, 11)
            s[4 * c + 3] = gfMul(b0, 11) ^ gfMul(b1, 13) ^ gfMul(b2, 9) ^ gfMul(b3, 14)
        }
    }
    addRoundKey(w.length - 16)
    for (let round = nr - 1; round >= 1; round--) {
        invShiftRows()
        invSubBytes()
        addRoundKey(round * 16)
        invMixColumns()
    }
    invShiftRows()
    invSubBytes()
    addRoundKey(0)
    return s
}

function aesDecryptECB(data, key) {
    const w = aesExpandKey(key)
    const out = new Uint8Array(data.length)
    for (let i = 0; i + 16 <= data.length; i += 16) {
        out.set(aesDecryptBlock(data.subarray(i, i + 16), w), i)
    }
    return out
}

function unpadPKCS7(data) {
    if (data.length === 0) return data
    const pad = data[data.length - 1]
    if (pad < 1 || pad > 16 || pad > data.length) return data
    return data.subarray(0, data.length - pad)
}

function md5Hex(str) {
    return Convert.hexEncode(Convert.md5(Convert.encodeUtf8(str)))
}

function bytesToArrayBuffer(u8) {
    const ab = new ArrayBuffer(u8.length)
    new Uint8Array(ab).set(u8)
    return ab
}

function decryptJMData(b64, ts, secret) {
    const key = new Uint8Array(Convert.encodeUtf8(md5Hex((ts || '') + (secret || JM_SECRET))))
    const data = new Uint8Array(Convert.decodeBase64(b64))
    const plain = Convert.decodeUtf8(bytesToArrayBuffer(unpadPKCS7(aesDecryptECB(data, key))))
    const start = plain.search(/[\[{]/)
    if (start <= 0) return plain
    let end = plain.length - 1
    while (end > start && plain[end] !== '}' && plain[end] !== ']') end--
    return plain.substring(start, end + 1)
}

function stripHtml(s) {
    if (!s) return ''
    return String(s)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
}

class JmComicSource extends ComicSource {
    name = 'JM漫画'
    key = 'jm_comic'
    version = '1.0.0'
    minAppVersion = '1.2.2'
    url = ''

    settings = {
        apiDomain: {
            title: 'API 域名（逗号分隔，留空用内置列表）',
            type: 'input',
            default: ''
        },
        imageDomain: {
            title: '图片 CDN 域名（逗号分隔，留空用内置列表）',
            type: 'input',
            default: ''
        },
        showComments: {
            title: '详情页加载评论',
            type: 'switch',
            default: true
        }
    }

    init() {
        this._apiIndex = 0
        this._cookieSeeded = false
        this._epDomainCache = {}
        this._apiDomains = null
        this._preferredImageDomain = ''
        this.refreshApiDomains().catch(() => { })
        this.refreshImgUrl().catch(() => { })
    }

    async refreshApiDomains() {
        if (this.loadSetting('apiDomain')) return
        try {
            const res = await Network.get(JM_DOMAIN_REFRESH_URL, { 'user-agent': JM_UA })
            if (res.status !== 200) return
            const data = decryptJMData(res.body, 0, JM_DOMAIN_SECRET)
            const json = JSON.parse(data)
            const servers = (json.Server || []).filter(s => typeof s === 'string' && s.length > 0)
            if (servers.length > 0) {
                this._apiDomains = servers.slice(0, 5)
                this._apiIndex = 0
            }
        } catch (e) { }
    }

    async refreshImgUrl() {
        try {
            const ts = String(Math.floor(Date.now() / 1000))
            const base = this.currentApiBase()
            const res = await Network.get(base + '/setting?app_img_shunt=0&express=', {
                'user-agent': JM_UA,
                'token': md5Hex(ts + JM_SECRET),
                'tokenparam': ts + ',' + JM_APP_VERSION
            })
            if (res.status !== 200) return
            const json = JSON.parse(decryptJMData(JSON.parse(res.body).data, ts))
            const host = String(json.img_host || '').trim().replace(/\/+$/, '')
            if (host.length > 0 && host.indexOf('http') === 0) {
                this._preferredImageDomain = host
            }
        } catch (e) { }
    }

    apiDomains() {
        if (this._apiDomains && this._apiDomains.length > 0) return this._apiDomains.slice()
        const custom = this.loadSetting('apiDomain')
        if (custom) {
            const list = String(custom).split(',').map(s => s.trim()).filter(s => s.length > 0)
            if (list.length > 0) return list
        }
        return JM_API_DOMAINS.slice()
    }

    imageDomains() {
        const custom = this.loadSetting('imageDomain')
        if (custom) {
            const list = String(custom).split(',').map(s => s.trim()).filter(s => s.length > 0)
            if (list.length > 0) return list
        }
        return JM_IMAGE_DOMAINS.slice()
    }

    apiBaseOf(domain) {
        return domain.indexOf('http') === 0 ? domain : 'https://' + domain
    }

    currentApiBase() {
        const list = this.apiDomains()
        return this.apiBaseOf(list[this._apiIndex % list.length])
    }

    randomImageDomain() {
        if (this._preferredImageDomain) return this._preferredImageDomain
        const list = this.imageDomains()
        return list[Math.floor(Math.random() * list.length)]
    }

    imageCandidates() {
        const list = this.imageDomains()
        if (this._preferredImageDomain && list.indexOf(this._preferredImageDomain) === -1) {
            return [this._preferredImageDomain].concat(list)
        }
        return list
    }

    imageUrlOf(domain, suffix) {
        return (domain.indexOf('http') === 0 ? domain : 'https://' + domain) + suffix
    }

    queryString(params) {
        let s = ''
        for (const k in params) {
            const v = params[k]
            if (v === undefined || v === null || v === '') continue
            s += (s.length > 0 ? '&' : '?') + encodeURIComponent(k) + '=' + encodeURIComponent(String(v))
        }
        return s
    }

    async apiGet(path, params, secret) {
        const list = this.apiDomains()
        secret = secret || JM_SECRET
        let lastError = null
        for (let i = 0; i < list.length; i++) {
            const idx = (this._apiIndex + i) % list.length
            const base = this.apiBaseOf(list[idx])
            const ts = String(Math.floor(Date.now() / 1000))
            const headers = {
                'user-agent': JM_UA,
                'token': md5Hex(ts + secret),
                'tokenparam': ts + ',' + JM_APP_VERSION
            }
            try {
                if (!this._cookieSeeded) {
                    this._cookieSeeded = true
                    try {
                        await Network.get(base + '/setting', headers)
                    } catch (e) { }
                }
                const url = base + path + this.queryString(params)
                const res = await Network.get(url, headers)
                if (res.status !== 200) throw 'HTTP ' + res.status
                const json = JSON.parse(res.body)
                if (json.code !== 200) throw json.errorMsg || ('code ' + json.code)
                const data = JSON.parse(decryptJMData(json.data, ts))
                this._apiIndex = idx
                return data
            } catch (e) {
                lastError = e
            }
        }
        throw lastError
    }


    segmentNum(photoId, fileName) {
        if (photoId < JM_SCRAMBLE_220980) return 0
        if (photoId < JM_SCRAMBLE_268850) return 10
        const x = photoId < JM_SCRAMBLE_421926 ? 10 : 8
        const base = String(fileName).replace(/\.[^.]+$/, '')
        const s = md5Hex(String(photoId) + base)
        return (s.charCodeAt(s.length - 1) % x) * 2 + 2
    }

    buildModifyScript(num) {
        return 'let modifyImage = (image) => {\n' +
            '    const num = ' + num + ';\n' +
            '    let blockSize = Math.floor(image.height / num);\n' +
            '    let remainder = image.height % num;\n' +
            '    let blocks = [];\n' +
            '    for (let i = 0; i < num; i++) {\n' +
            '        let start = i * blockSize;\n' +
            '        let end = start + blockSize + (i !== num - 1 ? 0 : remainder);\n' +
            '        blocks.push({ start: start, end: end });\n' +
            '    }\n' +
            '    let res = Image.empty(image.width, image.height);\n' +
            '    let y = 0;\n' +
            '    for (let i = blocks.length - 1; i >= 0; i--) {\n' +
            '        let block = blocks[i];\n' +
            '        let currentHeight = block.end - block.start;\n' +
            '        res.fillImageRangeAt(0, y, image, 0, block.start, image.width, currentHeight);\n' +
            '        y += currentHeight;\n' +
            '    }\n' +
            '    return res;\n' +
            '}\n'
    }

    normalizeId(id) {
        return String(id).toUpperCase().replace(/^JM/, '').replace(/\D/g, '')
    }

    coverUrl(albumId, size) {
        return this.imageUrlOf(this.randomImageDomain(), '/media/albums/' + albumId + (size || '') + '.jpg')
    }

    imageHeaders() {
        return {
            'referer': this.currentApiBase() + '/',
            'x-requested-with': 'com.JMComic3.app',
            'user-agent': JM_UA,
            'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
    }

    toStringList(v) {
        if (v == null) return []
        const arr = Array.isArray(v) ? v : [v]
        const out = []
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i]
            if (item == null) continue
            let s = ''
            if (typeof item === 'string') s = item
            else if (item.title != null) s = item.title
            else if (item.name != null) s = item.name
            else s = String(item)
            if (s && out.indexOf(s) === -1) out.push(s)
        }
        return out
    }

    searchItemToComic(item) {
        const id = String(item.id != null ? item.id : '')
        const tags = []
        const cat = item.category
        if (cat && (cat.title || cat.name)) tags.push(cat.title || cat.name)
        const sub = item.category_sub
        if (sub && (sub.title || sub.name)) tags.push(sub.title || sub.name)
        return new Comic({
            id: id,
            title: item.name || item.title || ('JM' + id),
            subTitle: item.author || '',
            cover: this.coverUrl(id, '_3x4'),
            tags: tags
        })
    }

    albumToComic(album) {
        const id = String(album.id != null ? album.id : '')
        return new Comic({
            id: id,
            title: album.name || ('JM' + id),
            subTitle: this.toStringList(album.author).join(', '),
            cover: this.coverUrl(id, '_3x4'),
            tags: this.toStringList(album.tags)
        })
    }

    parseComments(forum) {
        const out = []
        const list = forum.list || []
        for (let i = 0; i < list.length && out.length < 30; i++) {
            const item = list[i]
            if (!item || item.parent_CID && String(item.parent_CID) !== '0') continue
            const replies = item.replys || []
            out.push(new Comment({
                userName: item.nickname || item.username || ('UID ' + (item.UID != null ? item.UID : '')),
                content: stripHtml(item.content),
                time: item.addtime != null ? String(item.addtime) : '',
                replyCount: replies.length,
                id: item.CID != null ? String(item.CID) : null,
                score: item.likes != null ? Number(item.likes) : undefined
            }))
        }
        return out
    }

    search = {
        optionList: [
            {
                label: '排序',
                options: [
                    'mr-最新',
                    'mv-最多观看',
                    'mp-最多图片',
                    'tf-最多喜欢',
                    'rd-随机'
                ],
                default: 'mr'
            },
            {
                label: '时间',
                options: [
                    'a-全部时间',
                    't-今天',
                    'w-本周',
                    'm-本月'
                ],
                default: 'a'
            }
        ],

        load: async (keyword, options, page) => {
            const order = options && options[0] ? options[0] : 'mr'
            const time = options && options[1] ? options[1] : 'a'
            const data = await this.apiGet('/search', {
                main_tag: 0,
                search_query: keyword,
                page: page,
                o: order,
                t: time
            })
            if (data.redirect_aid) {
                const album = await this.apiGet('/album', { id: data.redirect_aid })
                return { comics: [this.albumToComic(album)], maxPage: 1 }
            }
            const total = parseInt(data.total, 10) || 0
            return {
                comics: (data.content || []).map(item => this.searchItemToComic(item)),
                maxPage: Math.max(1, Math.ceil(total / JM_PAGE_SIZE))
            }
        }
    }

    category = {
        title: '分类',
        parts: [
            {
                name: '题材',
                type: 'fixed',
                categories: JM_MAIN_TAGS.map(t => ({
                    label: t[1],
                    target: {
                        page: 'category',
                        attributes: { category: t[0], param: null }
                    }
                }))
            }
        ]
    }

    categoryComics = {
        optionList: [
            {
                label: '排序',
                options: [
                    'mr-最新',
                    'mv-最多观看',
                    'tf-最多喜欢',
                    'rd-随机'
                ],
                default: 'mr'
            }
        ],

        load: async (category, param, options, page) => {
            const order = options && options[0] ? options[0] : 'mr'
            const data = await this.apiGet('/search', {
                main_tag: parseInt(category, 10) || 0,
                search_query: '',
                page: page,
                o: order,
                t: 'a'
            })
            const total = parseInt(data.total, 10) || 0
            return {
                comics: (data.content || []).map(item => this.searchItemToComic(item)),
                maxPage: Math.max(1, Math.ceil(total / JM_PAGE_SIZE))
            }
        },

        ranking: {
            options: [
                'mv_t-今日热榜',
                'mv_w-本周热榜',
                'mv_m-本月热榜',
                'mv_a-总热榜'
            ],

            loadNext: async (option, next) => {
                const parts = String(option || 'mv_a').split('_')
                const o = parts[0] || 'mv'
                const t = parts[1] || 'a'
                const page = next || 1
                const data = await this.apiGet('/search', {
                    main_tag: 0,
                    search_query: '',
                    page: page,
                    o: o,
                    t: t
                })
                const total = parseInt(data.total, 10) || 0
                const maxPage = Math.max(1, Math.ceil(total / JM_PAGE_SIZE))
                return {
                    comics: (data.content || []).map(item => this.searchItemToComic(item)),
                    next: page < maxPage ? page + 1 : null
                }
            }
        }
    }

    comic = {
        loadInfo: async (id) => {
            id = this.normalizeId(id)
            const data = await this.apiGet('/album', { id: id })
            const chapters = {}
            const series = (data.series || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0))
            if (series.length === 0) {
                chapters[String(data.id != null ? data.id : id)] = data.name || ('JM' + id)
            } else {
                for (let i = 0; i < series.length; i++) {
                    const ch = series[i]
                    const sort = parseInt(ch.sort, 10) || 0
                    let label = ch.name || ''
                    if (sort > 1) label = '第' + sort + '話 ' + label
                    chapters[String(ch.id)] = label
                }
            }
            const details = {
                title: data.name || ('JM' + id),
                cover: this.coverUrl(id),
                description: data.description || '',
                tags: {
                    author: this.toStringList(data.author),
                    genre: this.toStringList(data.tags),
                    works: this.toStringList(data.works),
                    actors: this.toStringList(data.actors)
                },
                chapters: chapters,
                commentCount: parseInt(data.comment_total, 10) || 0,
                likesCount: parseInt(data.likes, 10) || 0,
                url: 'https://18comic.vip/album/' + id + '/'
            }
            if (this.loadSetting('showComments')) {
                try {
                    const forum = await this.apiGet('/forum', { mode: 'all', page: 1, aid: id })
                    details.comments = this.parseComments(forum)
                } catch (e) { }
            }
            try {
                if (data.related_list && data.related_list.length > 0) {
                    details.recommend = data.related_list.slice(0, 12).map(r => {
                        const rid = String(r.id != null ? r.id : (r.aid != null ? r.aid : ''))
                        return new Comic({
                            id: rid,
                            title: r.name || r.title || ('JM' + rid),
                            subTitle: r.author || '',
                            cover: this.coverUrl(rid, '_3x4')
                        })
                    })
                }
            } catch (e) { }
            return new ComicDetails(details)
        },

        loadEp: async (comicId, epId) => {
            const ep = this.normalizeId(epId || comicId)
            const data = await this.apiGet('/chapter', { id: ep })
            const names = data.images || []
            let domain = this._epDomainCache[ep]
            if (!domain) {
                domain = this.randomImageDomain()
                this._epDomainCache[ep] = domain
            }
            const images = []
            for (let i = 0; i < names.length; i++) {
                images.push(this.imageUrlOf(domain, '/media/photos/' + ep + '/' + names[i]))
            }
            return { images: images }
        },

        onImageLoad: async (url, comicId, epId) => {
            const headers = this.imageHeaders()
            const m = url.match(/\/media\/photos\/(\d+)\/([^/?]+)/)
            if (!m) return { url: url, headers: headers }
            const photoId = parseInt(m[1], 10)
            const fileName = m[2]
            const config = { url: url, headers: headers }
            if (fileName.toLowerCase().endsWith('.gif')) return config
            const num = this.segmentNum(photoId, fileName)
            if (num > 1) {
                config.modifyImage = this.buildModifyScript(num)
            }
            config.onLoadFailed = async () => {
                const retry = this.retryImageUrl(url)
                return { url: retry, headers: headers, modifyImage: config.modifyImage }
            }
            return config
        },

        onThumbnailLoad: (url) => ({
            url: url,
            headers: {
                'referer': this.currentApiBase() + '/',
                'user-agent': JM_UA,
                'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        }),

        idMatch: '^(\\d+)$',

        link: {
            domains: [
                '18comic.vip', '18comic.org', '18comic.com', '18comic.tw',
                'jmcomic.me', 'jmcomic1.me', 'jmcomic2.cc', 'jm-comic2.cc',
                'jm365.xyz', 'jm365.work', 'jmcomicgo.org'
            ],
            linkToId: (url) => {
                const m = String(url).match(/(?:album|photo)\/(\d+)/)
                return m ? m[1] : null
            }
        }
    }

    retryImageUrl(url) {
        const list = this.imageCandidates()
        for (let i = 0; i < list.length; i++) {
            const marker = '//' + list[i].replace(/^https?:\/\//, '') + '/'
            if (url.indexOf(marker) !== -1) {
                const next = list[(i + 1) % list.length]
                const nextMarker = next.indexOf('http') === 0 ? next : '//' + next
                return url.replace(marker, nextMarker + '/')
            }
        }
        return url + (url.indexOf('?') === -1 ? '?v=' + Date.now() : '')
    }
}