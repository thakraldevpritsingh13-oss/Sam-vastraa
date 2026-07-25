/* ============================================================
   SamVastra — script.js (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "919511531555"; // +91 95115 31555

  /* ---------- Subtle hero parallax ---------- */
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroVisual = document.querySelector(".hero-visual");
  var heroBg = document.querySelector(".hero-photo-bg");
  if (!prefersReducedMotion && (heroVisual || heroBg) && window.innerWidth > 640) {
    var ticking = false;
    function updateParallax() {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        if (heroVisual) heroVisual.style.transform = "translateY(" + Math.min(y * 0.06, 40) + "px)";
        if (heroBg) heroBg.style.transform = "translateY(" + Math.min(y * 0.12, 80) + "px)";
      }
      ticking = false;
    }
    document.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav drawer ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".nav-drawer");
  var scrim = document.querySelector(".nav-scrim");

  function closeDrawer() {
    if (toggle) toggle.classList.remove("open");
    if (drawer) drawer.classList.remove("open");
    if (scrim) scrim.classList.remove("open");
    document.body.style.overflow = "";
  }
  function openDrawer() {
    if (toggle) toggle.classList.add("open");
    if (drawer) drawer.classList.add("open");
    if (scrim) scrim.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = drawer && drawer.classList.contains("open");
      if (isOpen) closeDrawer(); else openDrawer();
    });
  }
  if (scrim) scrim.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }

  /* ---------- Reveal on scroll + stitch dividers ---------- */
  var revealTargets = document.querySelectorAll(".reveal, .stitch-divider");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".stat .num");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var otherA = other.querySelector(".faq-a");
        if (otherA) otherA.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Product category modal ---------- */
  var modalOverlay = document.querySelector(".modal-overlay");
  var modalTitle = document.querySelector("[data-modal-title]");
  var modalDesc = document.querySelector("[data-modal-desc]");
  var modalTags = document.querySelector("[data-modal-tags]");
  var modalClose = document.querySelector(".modal-close");

  var productData = {
    "school-uniforms": { title: "School Uniforms", desc: "Durable, comfortable daily-wear and formal uniform sets tailored to your institution's colours, crest and dress code, produced consistently across large student volumes.", tags: ["Shirts & Trousers", "Pinafores", "Ties & Belts", "House Colours"] },
    "corporate-wear": { title: "Corporate Wear", desc: "Formal shirts, blazers and trousers designed to reflect a professional brand identity across your entire team, with consistent fit and finish at scale.", tags: ["Shirts", "Blazers", "Trousers", "Corporate Branding"] },
    "polo-tshirts": { title: "Polo T-Shirts", desc: "Breathable, colour-fast polo t-shirts finished with embroidered or printed branding — a staple for corporate, retail and event uniforms.", tags: ["Cotton", "Dry-Fit", "Embroidery", "Screen Print"] },
    "round-neck-tshirts": { title: "Round Neck T-Shirts", desc: "Everyday round-neck t-shirts in bulk, suited for events, promotions and casual staff uniforms, available in a range of fabric weights.", tags: ["Cotton", "Poly-Cotton", "Custom Print"] },
    "hoodies": { title: "Hoodies", desc: "Premium fleece hoodies for institutions, corporate teams and events, customised with logos, names and colour combinations.", tags: ["Fleece", "Zip-Up", "Pullover", "Custom Branding"] },
    "aprons": { title: "Aprons", desc: "Functional aprons for hospitality, industrial and retail staff, built for daily wear with reinforced stitching and branding options.", tags: ["Kitchen", "Industrial", "Retail", "Custom Fit"] },
    "caps": { title: "Caps", desc: "Structured and unstructured caps finished with embroidered logos — a simple, consistent branding touch across your team.", tags: ["Embroidered Logo", "Adjustable Fit"] },
    "jackets": { title: "Jackets", desc: "Weather-ready jackets for industrial, corporate and institutional use, built for durability across bulk production runs.", tags: ["Windcheaters", "Bomber", "Industrial Grade"] },
    "sports-kits": { title: "Sports Kits", desc: "Complete sports kits — jerseys, shorts and track suits — built for movement and durability, customised with team colours and names.", tags: ["Jerseys", "Track Suits", "Team Colours"] },
    "industrial-uniforms": { title: "Industrial Uniforms", desc: "Heavy-duty workwear engineered for factory and industrial environments, prioritising safety, durability and comfort across long shifts.", tags: ["Coveralls", "Safety Grade Fabric", "Reinforced Stitching"] }
  };

  document.querySelectorAll("[data-product]").forEach(function (card) {
    card.addEventListener("click", function () {
      var key = card.getAttribute("data-product");
      var data = productData[key];
      if (!data || !modalOverlay) return;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalDesc) modalDesc.textContent = data.desc;
      if (modalTags) {
        modalTags.innerHTML = "";
        data.tags.forEach(function (t) {
          var span = document.createElement("span");
          span.textContent = t;
          modalTags.appendChild(span);
        });
      }
      modalOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });
  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- Contact form -> WhatsApp handoff ---------- */
  var enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = enquiryForm.querySelector("#f-name");
      var phone = enquiryForm.querySelector("#f-phone");
      var product = enquiryForm.querySelector("#f-product");
      var qty = enquiryForm.querySelector("#f-qty");
      var message = enquiryForm.querySelector("#f-message");

      var lines = [
        "Hello SamVastra, I'd like to enquire about bulk uniforms.",
        name && name.value ? "Name: " + name.value : "",
        phone && phone.value ? "Phone: " + phone.value : "",
        product && product.value ? "Product: " + product.value : "",
        qty && qty.value ? "Approx. quantity: " + qty.value : "",
        message && message.value ? "Message: " + message.value : ""
      ].filter(Boolean);

      var text = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
      window.open(url, "_blank");
    });
  }

  /* ---------- Scroll-spy active nav link (single page) ---------- */
  var navLinks = document.querySelectorAll(".nav-links a[href^='#'], .nav-drawer a[href^='#']");
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el });
  });

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s.el); });
  }
})();
