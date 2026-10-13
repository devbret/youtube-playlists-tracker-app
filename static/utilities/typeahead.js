const collator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

const rankMatch = (value, query) => {
  const lower = value.toLowerCase();
  const firstIndex = lower.indexOf(query);
  if (firstIndex === -1) {
    return null;
  }
  if (firstIndex === 0) {
    return { tier: 0, index: 0 };
  }
  for (
    let index = firstIndex;
    index !== -1;
    index = lower.indexOf(query, index + 1)
  ) {
    if (!WORD_CHARACTER.test(lower.charAt(index - 1))) {
      return { tier: 1, index };
    }
  }
  return { tier: 2, index: firstIndex };
};

const findMatches = (options, query, limit) => {
  const matches = [];
  options.forEach((value) => {
    const match = rankMatch(value, query);
    if (match) {
      matches.push({ value, ...match });
    }
  });
  return matches
    .sort((a, b) => a.tier - b.tier || collator.compare(a.value, b.value))
    .slice(0, limit);
};

export const attachTypeahead = (input, getOptions, limit = 10) => {
  const list = document.createElement("ul");
  list.id = `${input.id}-suggestions`;
  list.className = "typeahead-list";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  input.parentNode.appendChild(list);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", list.id);
  input.setAttribute("aria-expanded", "false");

  let matches = [];
  let activeIndex = -1;

  const setActive = (index) => {
    activeIndex = index;
    [...list.children].forEach((item, i) => {
      item.classList.toggle("active", i === index);
      item.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (index >= 0) {
      input.setAttribute("aria-activedescendant", list.children[index].id);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  const close = () => {
    list.hidden = true;
    list.innerHTML = "";
    matches = [];
    setActive(-1);
    input.setAttribute("aria-expanded", "false");
  };

  const select = (value) => {
    input.value = value;
    close();
  };

  const render = () => {
    const typed = input.value.trim();
    const query = typed.toLowerCase();
    if (!query) {
      close();
      return;
    }
    matches = findMatches(getOptions(), query, limit);
    if (
      matches.length === 0 ||
      (matches.length === 1 && matches[0].value === typed)
    ) {
      close();
      return;
    }

    list.innerHTML = "";
    matches.forEach(({ value, index }, i) => {
      const item = document.createElement("li");
      item.id = `${list.id}-${i}`;
      item.className = "typeahead-option";
      item.setAttribute("role", "option");
      const matched = document.createElement("strong");
      matched.textContent = value.slice(index, index + query.length);
      item.append(
        value.slice(0, index),
        matched,
        value.slice(index + query.length),
      );
      item.addEventListener("mouseenter", () => setActive(i));
      item.addEventListener("click", () => select(value));
      list.appendChild(item);
    });
    setActive(-1);

    list.style.top = `${input.offsetTop + input.offsetHeight + 2}px`;
    list.style.left = `${input.offsetLeft}px`;
    list.style.minWidth = `${input.offsetWidth}px`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };

  list.addEventListener("mousedown", (event) => event.preventDefault());

  input.addEventListener("input", render);
  input.addEventListener("blur", close);
  input.addEventListener("keydown", (event) => {
    if (list.hidden) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        render();
        if (!list.hidden) {
          setActive(0);
        }
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((activeIndex + 1) % matches.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive(activeIndex <= 0 ? matches.length - 1 : activeIndex - 1);
        break;
      case "Enter":
        if (activeIndex >= 0) {
          event.preventDefault();
          select(matches[activeIndex].value);
        } else {
          close();
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
    }
  });
};
