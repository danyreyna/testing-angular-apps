const config = {
  "*.{js,ts,html}": ["eslint --cache --fix", "prettier --write"],
  "*.{css,scss,md}": "prettier --write",
};

export default config;
