import type { Book } from "./types";

/**
 * Admin Manual — English. Same structure & figure codes (GBR-x.y) as the
 * Indonesian edition, so it reuses the exact same screenshot assets under
 * content/devbooks/manual/images/. URLs use the /en locale.
 */
export const manualEn: Book = {
  slug: "manual",
  lang: "en",
  langLabel: "English",
  title: "Admin Manual — PT Duta Firza Website & CMS",
  coverKicker: "Administrator Manual Book",
  coverTitle: "Website & CMS PT Duta Firza",
  subtitle: "A guide to managing content, reading data, and administering the admin dashboard",
  version: "1.0",
  year: "2026",
  chapters: [
    {
      no: "1",
      id: "bab1",
      title: "Introduction",
      blocks: [
        { t: "h3", id: "s1-1", text: "1.1 Purpose of this book" },
        {
          t: "lead",
          text: "This book is a practical guide for managing the PT Duta Firza website through the admin dashboard (CMS). After reading it, an admin should be able to:",
        },
        {
          t: "ul",
          items: [
            "Sign in to the admin dashboard and understand its layout.",
            "Manage the content of every page — text, images, documents — in two languages (Indonesian & English).",
            "Understand **where** and **how** each piece of content appears on the public website.",
            "Read visitor data and follow up on incoming messages (inquiries, job applications, and report-download leads).",
            "Manage admin user accounts and their access rights.",
          ],
        },
        { t: "h3", id: "s1-2", text: "1.2 Who this book is for" },
        {
          t: "p",
          text: "This book is aimed at **non-technical admins** responsible for day-to-day website content upkeep. The technical section (Chapter 7) is for system/IT administrators and may be skipped by content editors.",
        },
        { t: "h3", id: "s1-3", text: "1.3 Website & CMS overview" },
        { t: "p", text: "The PT Duta Firza website has two sides:" },
        {
          t: "ul",
          items: [
            "**Public side** — the pages visitors see (home, profile, solutions/services, investor relations, contact, careers). Addresses start with `/en/…` (English) or `/id/…` (Indonesian).",
            "**Admin side (CMS)** — where all the above content is managed. Addresses start with `/en/admin`. Accessible only after signing in.",
          ],
        },
        {
          t: "p",
          text: "Every change you save on the admin side appears **immediately** on the public side (unless the page status is set to hidden/coming soon — see [section 3.6](#s3-6)).",
        },
        {
          t: "callout",
          kind: "tip",
          title: "Quick Technical Note",
          body: [
            "The website is built with Next.js + MongoDB, supports two languages, light/dark theme, a rich text editor, image & PDF uploads, location maps, and visitor analytics (Umami). You don't need to understand this technology to use the CMS.",
          ],
        },
        { t: "h3", id: "s1-4", text: "1.4 Key terms" },
        {
          t: "table",
          head: ["Term", "Meaning"],
          rows: [
            ["**CMS / Admin dashboard**", "The `/en/admin` area where content is managed."],
            ["**Public side**", "Website pages seen by general visitors."],
            ["**Field**", "An input box on a form (e.g., Title, Description)."],
            [
              "**Localized field (ID/EN)**",
              "A field that has both an Indonesian and English version.",
            ],
            ["**Section**", "One block/part of a page (e.g., the Hero, Statistics section)."],
            [
              "**Page status**",
              "Setting for whether a page is shown: Published / Coming Soon / Hidden.",
            ],
            ["**Slug**", "A unique address fragment for an article/page."],
            ["**Inquiry**", "A message/question sent by a visitor through a form."],
            ["**Lead**", "Captured prospect data (e.g., when downloading a report)."],
            ["**RBAC**", "Role-based access control (Super Admin / Editor / Viewer)."],
          ],
        },
      ],
    },
    {
      no: "2",
      id: "bab2",
      title: "Getting Started",
      blocks: [
        { t: "h3", id: "s2-1", text: "2.1 Signing in (login) & out (logout)" },
        {
          t: "steps",
          items: [
            "Open a browser (Chrome/Edge/Safari) and go to `/en/admin/login`.",
            "Enter your admin account's **Email** and **Password**.",
            "Click **Sign in**. On success, you are taken to `/en/admin` (Dashboard).",
          ],
        },
        { t: "figure", code: "GBR-2.1", caption: "Admin sign-in page", url: "/en/admin/login" },
        {
          t: "callout",
          kind: "warn",
          title: "If sign-in fails",
          body: [
            "The message “Wrong email or password” means the credentials are incorrect. If your account is deactivated or your session has expired, the system returns you to the login page. Contact a Super Admin if you need a password reset (see [6.3](#s6-3)).",
          ],
        },
        {
          t: "p",
          text: "**Signing out (logout):** click your name/avatar at the bottom of the sidebar, then choose **Sign out**.",
        },
        { t: "h3", id: "s2-2", text: "2.2 Dashboard & sidebar orientation" },
        {
          t: "p",
          text: "After signing in, the screen splits in two: the **sidebar menu** on the left and the **work area** on the right. The menu is grouped into four sections:",
        },
        {
          t: "table",
          head: ["Section", "Menu items", "Function"],
          rows: [
            ["**Analytics**", "Dashboard, Visitor Analytics", "Overview & traffic data."],
            [
              "**Content**",
              "Home, About, Solutions, Investor Relations, Connect",
              "All content shown to the public.",
            ],
            [
              "**Inbox**",
              "Inquiries, Job Applications, Report Downloads",
              "Incoming messages & leads.",
            ],
            ["**System**", "Users", "Manage admin accounts (Super Admin only)."],
          ],
        },
        {
          t: "p",
          text: "A small red number (badge) on the **Inquiries** and **Job Applications** menus shows the count of unread messages and updates automatically.",
        },
        {
          t: "callout",
          kind: "note",
          title: "RBAC note",
          body: [
            "Which menus appear depends on your account's role & access. An editor may see only some menus. The **Users** menu appears only for Super Admins. See [Chapter 6](#bab6).",
          ],
        },
        {
          t: "figure",
          code: "GBR-2.2",
          caption: "Dashboard layout & sidebar menu",
          url: "/en/admin",
        },
        {
          t: "p",
          text: "The **Dashboard** page shows summary cards for each content group and the inbox — handy as a navigation starting point. The sidebar can be expanded/collapsed via the **Expand/Collapse sidebar** button.",
        },
        { t: "h3", id: "s2-3", text: "2.3 Change interface language & theme" },
        { t: "p", text: "At the bottom of the sidebar (account menu) you'll find:" },
        {
          t: "ul",
          items: [
            "**Language switcher** — changes the CMS display language between Indonesian & English. (This is different from filling content in two languages — see [3.1](#s3-1).)",
            "**Theme switcher** — Light / Dark / Follow system.",
            "**Change password** — to change your own account password (see [6.3](#s6-3)).",
          ],
        },
        {
          t: "figure",
          code: "GBR-2.3",
          caption: "Account menu in the sidebar · language & theme switchers",
        },
      ],
    },
    {
      no: "3",
      id: "bab3",
      title: "Core Concepts (used on every page)",
      blocks: [
        {
          t: "lead",
          text: "Most CMS pages use the same interface elements. Understand them once here, then you can manage any page in Chapters 4–6.",
        },
        { t: "h3", id: "s3-1", text: "3.1 Bilingual content (ID/EN)" },
        {
          t: "p",
          text: "Almost every text field (Title, Description, Summary, etc.) has **two versions**: Indonesian and English, marked by `ID` and `EN` tabs/indicators. Fill in both so content appears correctly in both language versions of the website.",
        },
        { t: "figure", code: "GBR-3.1", caption: "Filling in bilingual content on a single field" },
        {
          t: "callout",
          kind: "warn",
          title: "Important",
          body: [
            "If the **EN** version is left empty, English-speaking visitors may see a blank spot (except where it's stated that empty falls back to Indonesian text, such as in the shareholder table cells). Make it a habit to fill in both languages.",
          ],
        },
        { t: "h3", id: "s3-2", text: "3.2 Rich text editor" },
        {
          t: "p",
          text: "For long content (paragraphs, article bodies, job descriptions) a rich text editor is available with a toolbar: **bold, italic, headings, lists, links,** and **image** insertion. Use this toolbar to format; avoid pasting raw formatting from Word.",
        },
        { t: "figure", code: "GBR-3.2", caption: "Rich text editor & formatting toolbar" },
        { t: "h3", id: "s3-3", text: "3.3 Upload & crop images/video" },
        {
          t: "p",
          text: "For images/logos/photos: click the upload area or drag & drop a file. After choosing an image, a **Crop image** dialog appears:",
        },
        {
          t: "steps",
          items: [
            "Adjust **Zoom** and drag the image to set the visible area.",
            "Click **Apply crop** to use the cropped result, or **Upload full image** to use the image as-is.",
            "The system compresses the image automatically and shows the size savings (e.g., 2 MB → 400 KB).",
          ],
        },
        { t: "figure", code: "GBR-3.3", caption: "Crop & compress dialog before saving" },
        {
          t: "callout",
          kind: "tip",
          title: "Recommended image sizes",
          body: [
            "Every image field lists a recommended size & ratio (e.g., hero 1920×1080/16:9, leadership portrait 4:5, partner logo transparent PNG). Follow these for tidy results. Per-content details are in Chapter 4.",
          ],
        },
        {
          t: "p",
          text: "**Video** (About page only): upload MP4; the system compresses it to 1080p. There's an option to autoplay muted.",
        },
        { t: "h3", id: "s3-4", text: "3.4 Icon picker & map point picker" },
        {
          t: "ul",
          items: [
            "**Icon picker** — some cards (Statistics & Solutions on the home page) use an icon. Click to choose from the available list.",
            "**Map point picker** — on Reach (the home page map), click on the map or drag the pin to set a location's coordinates.",
          ],
        },
        { t: "figure", code: "GBR-3.4", caption: "Icon picker (left) & map point picker (right)" },
        { t: "h3", id: "s3-5", text: "3.5 Reordering (drag & drop)" },
        {
          t: "p",
          text: "Item lists (statistics, partners, products, milestones, etc.) can be reordered by dragging. Pull an item's handle to a new position.",
        },
        {
          t: "callout",
          kind: "note",
          title: "Reordering requirement",
          body: [
            "Drag-to-reorder is active only when the list is in **manual order**. If you're searching/filtering/sorting by name, clear the search & filters first so you can drag.",
          ],
        },
        { t: "h3", id: "s3-6", text: "3.6 Page status & section mode" },
        {
          t: "p",
          text: "Many public pages have a **Status** that determines whether the page is shown:",
        },
        {
          t: "table",
          head: ["Status", "Behavior on the public side"],
          rows: [
            ["**Published**", "The page is publicly accessible normally."],
            ["**Coming Soon**", "Visitors see a “Coming Soon” page."],
            ["**Hidden**", "The page returns 404 and does not appear in navigation."],
          ],
        },
        { t: "p", text: "In addition, many **sections** (page Title & Body) have a **mode**:" },
        {
          t: "ul",
          items: [
            "**Section on** (on/off) — turn the section's display on/off.",
            "**Default** — use the system's built-in text.",
            "**Custom** — use the text you write yourself.",
          ],
        },
        {
          t: "figure",
          code: "GBR-3.6",
          caption: "Page status (Published/Coming Soon/Hidden) & section mode",
        },
        { t: "h3", id: "s3-7", text: "3.7 Saving & previewing" },
        {
          t: "p",
          text: "When you change something, a **save bar** appears at the bottom of the screen. Click **Save** to save; the status changes to “Saved”. Many pages also have a **View public page** button to open the result in a new tab.",
        },
        { t: "figure", code: "GBR-3.7", caption: "Save bar & public preview link" },
        {
          t: "callout",
          kind: "warn",
          title: "Don't forget to Save",
          body: [
            "Changes take effect only after **Save** is pressed. Leaving a page without saving discards your changes.",
          ],
        },
        { t: "h3", id: "s3-8", text: "3.8 Search, filter & sort lists" },
        {
          t: "p",
          text: "List-style pages (products, projects, articles, inquiries, users) have a toolbar: a **Search** box, **Filter** (status/category), **Sort**, and a **card/table** view toggle. Below the list is pagination.",
        },
        { t: "figure", code: "GBR-3.8", caption: "Search, filter, sort, & view toggle toolbar" },
      ],
    },
    {
      no: "4",
      id: "bab4",
      title: "Managing Content",
      blocks: [
        {
          t: "lead",
          text: "This chapter covers each menu in the **Content** group. The pattern for each part is the same: What it manages → Fields/steps → Where it appears publicly → Status effect.",
        },
        {
          t: "callout",
          kind: "tip",
          title: "Reading the “Public page” column",
          body: [
            "That column is the address you can open to check the result. Change the `/en` prefix to `/id` for the Indonesian version.",
          ],
        },
        { t: "h3", id: "s4-1", text: "4.1 Home — “Home › Home Page” menu" },
        {
          t: "p",
          text: "**Admin location:** `/en/admin/landing` · **Appears at:** the home page `/en`. This page uses **tabs** whose order mirrors the home page section order:",
        },
        {
          t: "table",
          head: ["Tab", "What it sets", "Appears on the home page as"],
          rows: [
            [
              "**Hero**",
              "Eyebrow, title, subtitle, CTA buttons (primary & secondary), background image, hero decorations, plus each home section's title/subtitle.",
              "The top banner + each section heading.",
            ],
            [
              "**Statistics**",
              "Number cards (label ID/EN, prefix, value, suffix, icon). Reorderable.",
              "The compact numbers row (Quick Stats).",
            ],
            ["**Our Partners**", "—", "The partner logo strip. Managed elsewhere (see note)."],
            [
              "**Our Solutions**",
              "Solution cards (title, description, icon, link) + columns per row.",
              "The Solutions Spotlight section.",
            ],
            [
              "**Reach**",
              "Location points (city, province, coordinates via map).",
              "Coverage map + location list.",
            ],
            [
              "**Customers**",
              "Customer logos (name, logo, invert-on-dark option, active).",
              "The customer logo carousel.",
            ],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Partners are managed separately",
          body: [
            "The “Our Partners” tab only contains a shortcut. The partner logos are actually managed at `/en/admin/solutions/trading/partners` (Partners tab). See [4.3](#s4-3).",
          ],
        },
        { t: "h4", text: "Image recommendations" },
        {
          t: "ul",
          items: [
            "**Hero background:** 1920×1080 (16:9), JPG/WebP. Leave empty to use the default gradient. Decorations on = dark overlay + pattern; off = full image.",
            "**Customer logos:** transparent PNG, min 280×93 (displays ~40px).",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.1.1",
          caption: "Home Page editor & section tabs",
          url: "/en/admin/landing",
        },
        { t: "figure", code: "GBR-4.1.2", caption: "Hero tab: title, CTA, background image" },
        {
          t: "figure",
          code: "GBR-4.1.3",
          caption: "Statistics tab (number cards) & Solutions tab (cards + icons)",
        },
        {
          t: "figure",
          code: "GBR-4.1.4",
          caption: "Reach tab: marking location points on the map",
        },
        {
          t: "figure",
          code: "GBR-4.1.5",
          caption: "**Public result**: the home page (hero, statistics, solutions, map, customers)",
          url: "/en",
        },
        { t: "h3", id: "s4-2", text: "4.2 About Us — “About Us” menu" },
        { t: "p", text: "This group manages all pages under `/en/about`." },
        {
          t: "table",
          head: ["Admin menu", "Admin location", "What it manages", "Public page"],
          rows: [
            [
              "**About Us**",
              "`/admin/about`",
              "“Who We Are” content & the Business page intro; company values; profile video.",
              "`/en/about`",
            ],
            [
              "**Leadership**",
              "`/admin/about/leadership`",
              "List of Directors & Commissioners (photo, name, position, bio). Has tabs per type.",
              "`/en/about/leadership`",
            ],
            [
              "**History**",
              "`/admin/about/history`",
              "Milestone timeline (year, title, description, optional image).",
              "`/en/about/history`",
            ],
            [
              "**Our Business**",
              "`/admin/about/business`",
              "Core business & affiliated / sister companies (logo, description, divisions).",
              "`/en/about/business`",
            ],
            [
              "**Credentials**",
              "`/admin/about/credentials`",
              "Certifications & acknowledgements (document scan, issuer, year). Tabs: Certifications / Acknowledgements.",
              "`/en/about/credentials`",
            ],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Image recommendations (About)",
          body: [
            "Leadership photo: portrait 4:5 (min 400×500), face in the upper-center of the frame. Credential scan: portrait 3:4 (min 600×800). History image (optional): 16:9 (min 1280×720). About video: MP4 16:9, max 200 MB.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.2.1",
          caption: "Leadership editor",
          url: "/en/admin/about/leadership",
        },
        {
          t: "figure",
          code: "GBR-4.2.2",
          caption: "History editor (timeline)",
          url: "/en/admin/about/history",
        },
        { t: "figure", code: "GBR-4.2.3", caption: "Credentials & Affiliated Business editor" },
        {
          t: "figure",
          code: "GBR-4.2.4",
          caption: "**Public result** · Leadership & History",
          url: "/en/about/leadership",
        },
        { t: "h3", id: "s4-3", text: "4.3 Solutions — “Solutions” menu" },
        {
          t: "p",
          text: "This group manages the service pages under `/en/solutions`. Start from **Overview** to set each page's status.",
        },
        {
          t: "table",
          head: ["Admin menu", "What it manages", "Public page"],
          rows: [
            [
              "**Solutions (Overview)** `/admin/solutions`",
              "Status & content of each Solutions sub-page.",
              "—",
            ],
            [
              "**Trading** `/admin/solutions/trading`",
              "Hero & intro + inquiry form settings.",
              "`/en/solutions/trading`",
            ],
            [
              "**Trading · Partners** `/admin/solutions/trading/partners`",
              "Hero/intro + partner logos (also used in the home strip).",
              "`/en/solutions/trading/partners`",
            ],
            [
              "**Trading · Products** `/admin/solutions/trading/products`",
              "Hero/intro + product catalog (principle, origin, type, etc.).",
              "`/en/solutions/trading/products`",
            ],
            [
              "**Manufacturing** `/admin/solutions/manufacturing`",
              "Content + quote form.",
              "`/en/solutions/manufacturing`",
            ],
            [
              "**EPC** `/admin/solutions/epc`",
              "Hero/intro. Project items are managed in Master · Projects.",
              "`/en/solutions/epc`",
            ],
            [
              "**Technology** `/admin/solutions/technology`",
              "Content + inquiry form + external website link.",
              "`/en/solutions/technology`",
            ],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Forms & WhatsApp",
          body: [
            "Some Solutions pages have an **inquiry form** that can be turned on/off with its fields configured via the Form Builder (see 4.5 & 5.3). The Products page supports a **WhatsApp Chat** button — enter an international-format number (e.g., `628123456789`); leave empty to disable.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.3.1",
          caption: "Solutions Overview & status settings",
          url: "/en/admin/solutions",
        },
        {
          t: "figure",
          code: "GBR-4.3.2",
          caption: "Trading product catalog + WhatsApp",
          url: "/en/admin/solutions/trading/products",
        },
        {
          t: "figure",
          code: "GBR-4.3.3",
          caption: "**Public result** · product catalog",
          url: "/en/solutions/trading/products",
        },
        { t: "h3", id: "s4-4", text: "4.4 Investor Relations — “Investor Relations” menu" },
        { t: "p", text: "This group manages the investor pages under `/en/investor-relations`." },
        {
          t: "table",
          head: ["Admin menu", "What it manages", "Public page"],
          rows: [
            [
              "**Stocks** `/admin/investor-relations/stocks`",
              "Content + shareholder composition table (dynamic columns & rows).",
              "`/en/investor-relations/stocks`",
            ],
            [
              "**Reports** `/admin/investor-relations/reports`",
              "Annual & financial reports (PDF + thumbnail) + gate form settings.",
              "`/en/investor-relations/reports`",
            ],
            [
              "**Publications** `/admin/investor-relations/publications`",
              "Publications page content (umbrella for news & press releases).",
              "`/en/investor-relations/publications`",
            ],
            [
              "**Press Release** `/admin/investor-relations/press-release`",
              "Press release articles (title, slug, body, date, image).",
              "`/en/investor-relations/publications/press-release`",
            ],
            [
              "**Newsroom** `/admin/investor-relations/newsroom`",
              "News articles (title, slug, body, optional original source).",
              "`/en/investor-relations/publications/newsroom`",
            ],
            [
              "**Company Profile** `/admin/investor-relations/company-profile`",
              "Upload the Company Profile PDF.",
              "`/en/investor-relations/publications/company-profile`",
            ],
          ],
        },
        { t: "h4", text: "Shareholder table (Stocks)" },
        {
          t: "p",
          text: "Build the table by adding **columns** first (label + left/center/right alignment), then **rows**. Fill cells per language; an empty EN cell automatically falls back to the Indonesian text. Check “Emphasize this row” for a total row.",
        },
        { t: "h4", text: "Reports & thumbnail (Reports)" },
        { t: "p", text: "For each report, upload a PDF and choose the thumbnail source:" },
        {
          t: "ul",
          items: [
            "**Upload thumbnail** — you upload your own image.",
            "**Use the PDF's first page** — the system creates a thumbnail from page 1 of the PDF (click Generate from PDF).",
            "**Use default** — a neutral placeholder.",
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Automatic slug",
          body: [
            "For articles (Press Release/Newsroom), the **slug** is generated automatically from the English title. Edit it manually if needed. The slug becomes part of the article's public address.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.4.1",
          caption: "Shareholder table builder",
          url: "/en/admin/investor-relations/stocks",
        },
        {
          t: "figure",
          code: "GBR-4.4.2",
          caption: "Upload a report & choose a thumbnail",
          url: "/en/admin/investor-relations/reports",
        },
        { t: "figure", code: "GBR-4.4.3", caption: "Article editor (title, slug, rich text body)" },
        {
          t: "figure",
          code: "GBR-4.4.4",
          caption: "**Public result** · report list",
          url: "/en/investor-relations/reports",
        },
        { t: "h3", id: "s4-5", text: "4.5 Contact & Careers — “Connect” menu" },
        { t: "h4", text: "Contact page — /admin/contact → /en/contact" },
        { t: "p", text: "This page has 4 tabs:" },
        {
          t: "table",
          head: ["Tab", "Contents"],
          rows: [
            ["**Content**", "Hero & intro of the contact page."],
            [
              "**Location & Map**",
              "Show/hide the map, factory location, business hours, directions button; Google Maps embed & directions link (HQ & Factory).",
            ],
            [
              "**Contact Info**",
              "**Source of the “Settings” data**: address, hours, phone, general/sales email, and social media links. This data is used across the whole site (e.g., the footer).",
            ],
            ["**Form**", "Enable/disable the contact form & configure its fields (Form Builder)."],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "How to embed a Google Map",
          body: [
            "Open Google Maps → **Share → Embed a map**, then paste the iframe's `src` URL into the embed field. No API key needed.",
          ],
        },
        { t: "h4", text: "Careers page — /admin/contact/careers → /en/contact/careers" },
        {
          t: "p",
          text: "Tabs: **Page** (hero/intro), **Job Boards** (external board links), **Culture & Benefits**, **Openings** (position list), and **Application Form**. For each **Opening**, choose the **Apply Method**:",
        },
        {
          t: "table",
          head: ["Method", "Behavior of the public “Apply” button"],
          rows: [
            [
              "**In-website form**",
              "The applicant fills a form & uploads a CV; the application lands in the Job Applications inbox (Chapter 5.4).",
            ],
            ["**External link**", "Redirects to an ATS/job-board URL (`applyUrl`)."],
            ["**Send email**", "Opens the applicant's email app to the target address."],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Form Builder",
          body: [
            "The contact form, quote form, and application form all use the same **Form Builder**: add fields (type, label, placeholder, required/optional), set the submit button label & success message. For the application form, the name, email, phone, and CV upload fields are always present.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.5.1",
          caption: "Contact Info tab (address, hours, email, social)",
          url: "/en/admin/contact",
        },
        {
          t: "figure",
          code: "GBR-4.5.2",
          caption: "Openings editor & apply method",
          url: "/en/admin/contact/careers",
        },
        { t: "figure", code: "GBR-4.5.3", caption: "Form Builder: composing form fields" },
        {
          t: "figure",
          code: "GBR-4.5.4",
          caption: "**Public result** · Contact & Careers",
          url: "/en/contact",
        },
      ],
    },
    {
      no: "5",
      id: "bab5",
      title: "Reading Data & Following Up on the Inbox",
      blocks: [
        {
          t: "lead",
          text: "This chapter explains how to read the numbers & follow up on messages coming from the website.",
        },
        { t: "h3", id: "s5-1", text: "5.1 Dashboard (overview)" },
        {
          t: "p",
          text: "**Location:** `/en/admin`. The dashboard shows summary cards for each content group and the inbox, plus the last-updated date. The card contents adapt to your account's access rights.",
        },
        { t: "figure", code: "GBR-5.1", caption: "Dashboard overview", url: "/en/admin" },
        { t: "h3", id: "s5-2", text: "5.2 Visitor Analytics (Umami)" },
        {
          t: "p",
          text: "**Location:** `/en/admin/visitor-analytics`. Shows public-site traffic measured by **Umami**, embedded directly in the dashboard. The **Open in Umami** button opens the full Umami dashboard in a new tab.",
        },
        {
          t: "p",
          text: "What you'd typically read: number of visitors & page views, top pages, referral sources (referrers), devices, and country/city. Use the date range to compare periods.",
        },
        {
          t: "callout",
          kind: "note",
          title: "If it shows “Not configured”",
          body: [
            "It means the Umami credentials haven't been filled in. This is a technical task — see [7.1](#s7-1).",
          ],
        },
        {
          t: "figure",
          code: "GBR-5.2",
          caption: "Visitor analytics",
          url: "/en/admin/visitor-analytics",
        },
        { t: "h3", id: "s5-3", text: "5.3 Inquiries Inbox" },
        {
          t: "p",
          text: "**Location:** `/en/admin/inquiries`. Contains submissions from the **Trading, Manufacturing, EPC, Technology,** and **Contact** forms. This menu shows an unread-count badge.",
        },
        { t: "h4", text: "Filter tabs" },
        {
          t: "p",
          text: "All · Unread · New · Read · In Progress · Resolved · Archived. There's also a search box (company, name, email).",
        },
        { t: "h4", text: "Following up on an inquiry" },
        {
          t: "steps",
          items: [
            "Click a row to open the **details** (message body + sender info & source form).",
            "Update the **status** to match progress: New → In Progress → Resolved (or Archived).",
            "Mark **read / unread** as needed.",
            "Click **Reply via email** to reply through your email app.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Read ≠ Status",
          body: [
            "“Unread/Read” only marks whether you've opened the message. “Status” (New/In Progress/Resolved/Archived) is a separate follow-up workflow.",
          ],
        },
        {
          t: "figure",
          code: "GBR-5.3",
          caption: "Inquiries inbox & tabs",
          url: "/en/admin/inquiries",
        },
        {
          t: "figure",
          code: "GBR-5.4",
          caption: "Inquiry details, change status, & reply by email",
        },
        { t: "h3", id: "s5-4", text: "5.4 Job Applications" },
        {
          t: "p",
          text: "**Location:** `/en/admin/applications`. Contains applications from the careers form (the “In-website form” method), complete with CVs. Status flow (recruitment pipeline): **New → Reviewing → Shortlisted → Rejected / Hired**.",
        },
        {
          t: "p",
          text: "Open an application to see the details & click **Download CV** to get the applicant's file.",
        },
        {
          t: "figure",
          code: "GBR-5.5",
          caption: "Job Applications inbox & pipeline",
          url: "/en/admin/applications",
        },
        { t: "h3", id: "s5-5", text: "5.5 Report Downloads (leads)" },
        {
          t: "p",
          text: "**Location:** `/en/admin/report-downloads`. Captures a **lead** when a visitor views or downloads an investor report PDF. There are two parts:",
        },
        {
          t: "ul",
          items: [
            "**View captured leads** — a list of leads (name, company, email, report) marked with a View or Download action. Filterable by report type (Annual/Financial) and searchable.",
            "**Form settings** — enable/disable the gate: require visitors to fill in data before viewing/downloading. Four core fields are always collected; other fields can be added/removed.",
          ],
        },
        {
          t: "figure",
          code: "GBR-5.6",
          caption: "Report download leads",
          url: "/en/admin/report-downloads",
        },
        { t: "figure", code: "GBR-5.7", caption: "Download/view gate form settings" },
        {
          t: "callout",
          kind: "note",
          title: "Notifications",
          body: [
            "New inquiries & applications can trigger automatic email notifications (via the Resend service), and the sidebar's unread badges update in real time without needing a refresh.",
          ],
        },
      ],
    },
    {
      no: "6",
      id: "bab6",
      title: "User Management & Access Rights (RBAC)",
      blocks: [
        {
          t: "p",
          text: "**Location:** `/en/admin/users`. **Only a Super Admin** can open this menu.",
        },
        { t: "h3", id: "s6-1", text: "6.1 Roles: Super Admin, Editor, Viewer" },
        {
          t: "table",
          head: ["Role", "Rights"],
          rows: [
            ["**Super Admin**", "Full access to all sections, plus user management."],
            [
              "**Editor**",
              "Can only change the sections checked under “Section access”. The Dashboard is always available.",
            ],
            ["**Viewer**", "Read-only (cannot change anything)."],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Section access (scope)",
          body: [
            "For an Editor, check which sections they may open & change (e.g., only Newsroom & Press Release). This keeps duties tidy — e.g., the PR team only handles publications, the HR team only handles careers & applications.",
          ],
        },
        { t: "h3", id: "s6-2", text: "6.2 Adding & editing users" },
        {
          t: "steps",
          items: [
            "Click **Add** user, fill in name, email, password, and choose a role.",
            "If the role is **Editor**, check the sections they may access.",
            "Click **Save**.",
          ],
        },
        {
          t: "p",
          text: "**Deactivating (delete):** the account is deactivated & hidden, and its email is free to reuse. Role/deactivation changes take effect on that user's next request.",
        },
        {
          t: "callout",
          kind: "warn",
          title: "Safeguards",
          body: [
            "You cannot delete, deactivate, or demote **your own account**. The last active Super Admin cannot be demoted — promote another Super Admin first.",
          ],
        },
        { t: "figure", code: "GBR-6.1", caption: "User list", url: "/en/admin/users" },
        { t: "figure", code: "GBR-6.2", caption: "User form: role & section access" },
        { t: "h3", id: "s6-3", text: "6.3 Reset & change password" },
        {
          t: "ul",
          items: [
            "**Reset password (for someone else)** — a Super Admin sets a new password for a user. The user is not notified automatically, so tell them directly.",
            "**Change password (your own account)** — via the account menu in the sidebar; enter your current password + a new password.",
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Password rules",
          body: ["At least **12 characters**. The confirmation must match."],
        },
        { t: "figure", code: "GBR-6.3", caption: "Reset / change password dialog" },
      ],
    },
    {
      no: "7",
      id: "bab7",
      title: "Technical & Operational Appendix",
      blocks: [
        {
          t: "callout",
          kind: "warn",
          title: "For system / IT administrators",
          body: [
            "This section is technical and generally **not needed by day-to-day content editors**. Changes here usually require server/hosting access.",
          ],
        },
        { t: "h3", id: "s7-1", text: "7.1 Analytics configuration (Umami)" },
        {
          t: "p",
          text: "For the [Visitor Analytics](#s5-2) page to show data, fill in the following environment variables then redeploy: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_SHARE_URL`.",
        },
        { t: "h3", id: "s7-2", text: "7.2 Environment variables (.env) & deploy" },
        {
          t: "ul",
          items: [
            "All variables are documented in the `.env.example` file (MongoDB URI, Resend key, GCS credentials, Umami, etc.). Copy it to `.env.local` for local use.",
            "The app validates variables at boot — if any are missing/invalid, the app fails to start with a clear message.",
            "**Build:** `pnpm build`. **Hosting:** GCP (Compute Engine / Cloud Run) — see the repo README.",
          ],
        },
        { t: "h3", id: "s7-3", text: "7.3 Data backup & recovery" },
        {
          t: "ul",
          items: [
            "All content & messages are stored in **MongoDB**; files (images/PDFs/CVs) in **Google Cloud Storage**.",
            "Schedule periodic database backups (e.g., `mongodump`) and ensure the GCS bucket has a retention policy. Keep a copy of credentials in a safe place.",
          ],
        },
        { t: "h3", id: "s7-4", text: "7.4 Common troubleshooting (FAQ)" },
        {
          t: "table",
          head: ["Symptom", "Likely cause & fix"],
          rows: [
            [
              "A change isn't showing on the public side",
              "Make sure you **Saved**; check the page status isn't Hidden/Coming Soon; refresh the public page.",
            ],
            [
              "The English version is empty",
              "The EN field hasn't been filled — complete the EN version (see [3.1](#s3-1)).",
            ],
            [
              "Can't drag to reorder",
              "Clear the search/filters, choose Manual order (see [3.5](#s3-5)).",
            ],
            [
              "Analytics empty / “Not configured”",
              "Fill in the Umami variables (see [7.1](#s7-1)).",
            ],
            [
              "A certain menu doesn't appear",
              "The account's access is limited; ask a Super Admin to adjust (Chapter 6).",
            ],
            [
              "Suddenly logged out",
              "The session expired or the account was deactivated; log in again / contact a Super Admin.",
            ],
          ],
        },
      ],
    },
  ],
  screenshotChecklist: [
    { code: "GBR-2.1", location: "/en/admin/login", frame: "Login form", chapter: "2.1" },
    { code: "GBR-2.2", location: "/en/admin", frame: "Dashboard + full sidebar", chapter: "2.2" },
    {
      code: "GBR-2.3",
      location: "account menu (sidebar)",
      frame: "Language, theme, sign-out",
      chapter: "2.3",
    },
    { code: "GBR-3.1", location: "any form", frame: "ID/EN field", chapter: "3.1" },
    { code: "GBR-3.2", location: "rich text editor", frame: "Formatting toolbar", chapter: "3.2" },
    { code: "GBR-3.3", location: "upload dialog", frame: "Crop & compress", chapter: "3.3" },
    {
      code: "GBR-3.4",
      location: "Statistics / Reach",
      frame: "Icon & map point pickers",
      chapter: "3.4",
    },
    {
      code: "GBR-3.6",
      location: "a page with status",
      frame: "Status & section mode",
      chapter: "3.6",
    },
    { code: "GBR-3.7", location: "any form", frame: "Save bar + View public", chapter: "3.7" },
    {
      code: "GBR-3.8",
      location: "a list page",
      frame: "Search / filter / sort / card-table",
      chapter: "3.8",
    },
    { code: "GBR-4.1.1", location: "/en/admin/landing", frame: "The tabs row", chapter: "4.1" },
    { code: "GBR-4.1.2", location: "landing · Hero tab", frame: "Hero form", chapter: "4.1" },
    {
      code: "GBR-4.1.3",
      location: "landing · Statistics & Solutions",
      frame: "Number & solution cards",
      chapter: "4.1",
    },
    { code: "GBR-4.1.4", location: "landing · Reach", frame: "Map picker", chapter: "4.1" },
    { code: "GBR-4.1.5", location: "/en", frame: "Home page result", chapter: "4.1" },
    {
      code: "GBR-4.2.1",
      location: "/en/admin/about/leadership",
      frame: "Director/Commissioner cards",
      chapter: "4.2",
    },
    {
      code: "GBR-4.2.2",
      location: "/en/admin/about/history",
      frame: "Milestone timeline",
      chapter: "4.2",
    },
    {
      code: "GBR-4.2.3",
      location: "about · Credentials & Business",
      frame: "Credential/affiliate editor",
      chapter: "4.2",
    },
    { code: "GBR-4.2.4", location: "/en/about/leadership", frame: "Public result", chapter: "4.2" },
    {
      code: "GBR-4.3.1",
      location: "/en/admin/solutions",
      frame: "Status overview",
      chapter: "4.3",
    },
    {
      code: "GBR-4.3.2",
      location: "/en/admin/solutions/trading/products",
      frame: "Product catalog + WhatsApp",
      chapter: "4.3",
    },
    {
      code: "GBR-4.3.3",
      location: "/en/solutions/trading/products",
      frame: "Public result",
      chapter: "4.3",
    },
    {
      code: "GBR-4.4.1",
      location: "/en/admin/investor-relations/stocks",
      frame: "Shareholder table",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.2",
      location: "/en/admin/investor-relations/reports",
      frame: "Upload PDF + thumbnail",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.3",
      location: "IR · article editor",
      frame: "Title, slug, body",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.4",
      location: "/en/investor-relations/reports",
      frame: "Public result",
      chapter: "4.4",
    },
    {
      code: "GBR-4.5.1",
      location: "/en/admin/contact · Contact Info",
      frame: "Address, hours, email, social",
      chapter: "4.5",
    },
    {
      code: "GBR-4.5.2",
      location: "/en/admin/contact/careers",
      frame: "Openings & apply method",
      chapter: "4.5",
    },
    { code: "GBR-4.5.3", location: "Form Builder", frame: "Composing fields", chapter: "4.5" },
    { code: "GBR-4.5.4", location: "/en/contact", frame: "Public result", chapter: "4.5" },
    { code: "GBR-5.1", location: "/en/admin", frame: "Summary cards", chapter: "5.1" },
    {
      code: "GBR-5.2",
      location: "/en/admin/visitor-analytics",
      frame: "Umami embed",
      chapter: "5.2",
    },
    { code: "GBR-5.3", location: "/en/admin/inquiries", frame: "List + tabs", chapter: "5.3" },
    {
      code: "GBR-5.4",
      location: "inquiry · details",
      frame: "Change status + reply email",
      chapter: "5.3",
    },
    {
      code: "GBR-5.5",
      location: "/en/admin/applications",
      frame: "Pipeline + download CV",
      chapter: "5.4",
    },
    {
      code: "GBR-5.6",
      location: "/en/admin/report-downloads",
      frame: "Leads list (View/Download)",
      chapter: "5.5",
    },
    {
      code: "GBR-5.7",
      location: "report-downloads · Settings",
      frame: "Gate form",
      chapter: "5.5",
    },
    { code: "GBR-6.1", location: "/en/admin/users", frame: "User list", chapter: "6.2" },
    { code: "GBR-6.2", location: "users · form", frame: "Role + section access", chapter: "6.2" },
    {
      code: "GBR-6.3",
      location: "password dialog",
      frame: "Reset / change password",
      chapter: "6.3",
    },
  ],
};
