# [2.3.0](https://github.com/Billos/Panoptikauth/compare/2.2.0...2.3.0) (2026-02-11)


### Features

* Adds priority support to Gotify messages ([7c763c4](https://github.com/Billos/Panoptikauth/commit/7c763c4bb6e4c88e30b2161057819af5ae9c493d))
* Adds test event support ([d7ca1f3](https://github.com/Billos/Panoptikauth/commit/d7ca1f3e0cba24eb1cd5c5570f2aa6f129a559fb))
* Adds Tracearr webhook support ([bfa8560](https://github.com/Billos/Panoptikauth/commit/bfa85603706f534b8f244f11f925eadbe60c087c))

# [2.2.0](https://github.com/Billos/Panoptikauth/compare/2.1.0...2.2.0) (2026-01-27)


### Bug Fixes

* Logs if the SLACK token is configured ([93b7017](https://github.com/Billos/Panoptikauth/commit/93b7017882785689388e83a6a69500a8fd685396))


### Features

* Implements Authentik webhook handler ([114f34f](https://github.com/Billos/Panoptikauth/commit/114f34f4538cf88031524be508eec364a0f29e30))
* Remove Slack specific token ([361a2f0](https://github.com/Billos/Panoptikauth/commit/361a2f0ee64ae33764dafa5253c588ec36950aff))

# [2.1.0](https://github.com/Billos/Panoptikauth/compare/2.0.2...2.1.0) (2026-01-26)


### Features

* Adds Slack notification support ([4ac27e3](https://github.com/Billos/Panoptikauth/commit/4ac27e31108776ff64745e59578d7336d3f17531))

## [2.0.2](https://github.com/Billos/Panoptikauth/compare/2.0.1...2.0.2) (2026-01-19)


### Bug Fixes

* Updates docker project name ([277b0b8](https://github.com/Billos/Panoptikauth/commit/277b0b8a1fe4181ff6c9bde25379d069a924ab96))

## [2.0.1](https://github.com/Billos/Panoptikauth/compare/2.0.0...2.0.1) (2026-01-19)


### Bug Fixes

* Updates docker project name ([615e3ae](https://github.com/Billos/Panoptikauth/commit/615e3aef72af46ae519f582a94a5e55efae21afd))

# [2.0.0](https://github.com/Billos/Panoptikauth/compare/1.6.0...2.0.0) (2026-01-19)


### Features

* Rename project from authentik-gotify-bridge to Panoptikauth ([#16](https://github.com/Billos/Panoptikauth/issues/16)) ([e0b9f9f](https://github.com/Billos/Panoptikauth/commit/e0b9f9f37a09a023620862c700b065b098a8434b))


### BREAKING CHANGES

* Rename project

* Initial plan

* Rename project from authentik-gotify-bridge to Panoptikauth

Co-authored-by: Billos <5809662+Billos@users.noreply.github.com>

* Fix .releaserc.json dockerProject to use full path billos/panoptikauth

Co-authored-by: Billos <5809662+Billos@users.noreply.github.com>

# [1.6.0](https://github.com/Billos/Panoptikauth/compare/1.5.0...1.6.0) (2026-01-08)


### Features

* Adds Google Maps link ([9fc5a8c](https://github.com/Billos/Panoptikauth/commit/9fc5a8c3e5eee2cff419d1122fe6781d228bfab7))

# [1.5.0](https://github.com/Billos/Panoptikauth/compare/1.4.0...1.5.0) (2026-01-08)


### Features

* Add complete ISO 3166-1 alpha-2 country emoji mappings ([#12](https://github.com/Billos/panoptikauth/issues/12)) ([ce7005a](https://github.com/Billos/panoptikauth/commit/ce7005a1a00c62057e047ab8f5ed7ece3ad295b0))

# [1.4.0](https://github.com/Billos/panoptikauth/compare/1.3.0...1.4.0) (2026-01-08)


### Features

* Add support for user_write event notifications ([#11](https://github.com/Billos/panoptikauth/issues/11)) ([de08bcf](https://github.com/Billos/panoptikauth/commit/de08bcfb6c03ce4f59bab7e5e5567a8c2ecb1926))

# [1.3.0](https://github.com/Billos/panoptikauth/compare/1.2.0...1.3.0) (2026-01-08)


### Features

* Add geolocation, ASN, and IP address to login notifications ([#10](https://github.com/Billos/panoptikauth/issues/10)) ([c57bf19](https://github.com/Billos/panoptikauth/commit/c57bf19c035dbb0eca653b0235a2efce74693286))

# [1.2.0](https://github.com/Billos/panoptikauth/compare/1.1.0...1.2.0) (2026-01-03)


### Bug Fixes

* Add --include flag to tsx watch for monitoring all TypeScript files ([#7](https://github.com/Billos/panoptikauth/issues/7)) ([30c1457](https://github.com/Billos/panoptikauth/commit/30c1457ff2372758c2585f7a7334c1d444093577))
* Correct name for env var ([c3976ba](https://github.com/Billos/panoptikauth/commit/c3976ba1d3886eb4408605438f1202586d848676))


### Features

* Activate CI, not dry anymore ([dac223b](https://github.com/Billos/panoptikauth/commit/dac223b513ae7cf3da60f840d941cc169353f54c))
* Convert semantic-release from manual to GitHub Actions  ([#8](https://github.com/Billos/panoptikauth/issues/8)) ([55f891c](https://github.com/Billos/panoptikauth/commit/55f891c19ec1255c27ecc6904aaf76ac1a191110))

# [1.1.0](https://github.com/Billos/panoptikauth/compare/1.0.2...1.1.0) (2026-01-03)


### Bug Fixes

* missing dependencies ([743cbb3](https://github.com/Billos/panoptikauth/commit/743cbb3f86e9f0379a252704a2c4195e1a39de5f))


### Features

* Formats Authentik notification events ([4eb68fc](https://github.com/Billos/panoptikauth/commit/4eb68fcf56181a1107ed94f9db640fc125e31e3e))
* Formats Authentik notification events ([c75e612](https://github.com/Billos/panoptikauth/commit/c75e61215e4eb50a4f650273321b23e7da2e9785))

## [1.0.2](https://github.com/Billos/panoptikauth/compare/1.0.1...1.0.2) (2026-01-02)


### Bug Fixes

* Adds TODO item to update package version ([be49d50](https://github.com/Billos/panoptikauth/commit/be49d5065c6a692a5bdc56d00dfe63c47e709db3))

## [1.0.1](https://github.com/Billos/panoptikauth/compare/1.0.0...1.0.1) (2026-01-02)


### Bug Fixes

* Replaces text/json middleware with json middleware ([c649309](https://github.com/Billos/panoptikauth/commit/c649309f3760282da8bf14ac0f4c05b57797357e))

# 1.0.0 (2026-01-02)


### Bug Fixes

* Configures development environment ([0c7c47b](https://github.com/Billos/panoptikauth/commit/0c7c47b7b832b573b2aef98ae50c75429f89924f))


### Features

* Configures project for linting and formatting ([339cfde](https://github.com/Billos/panoptikauth/commit/339cfde7af95a03b34443b2dedda24bc963b23d7))
* Configures semantic release for automation ([abdc5d1](https://github.com/Billos/panoptikauth/commit/abdc5d18b084976c74cc4a0af55bd4ea4e926755))
* Docker files ([3c478f2](https://github.com/Billos/panoptikauth/commit/3c478f2dadcc45c165ac666f2ea6ecd3f23cb6ad))
* Initialize TypeScript project with development watch mode ([b69d2a8](https://github.com/Billos/panoptikauth/commit/b69d2a8f2d68c7bb647dfd374d10158c21d6f1ce))
* POST endpoint that bridges the request to Gotify ([ba06a12](https://github.com/Billos/panoptikauth/commit/ba06a12b3f033f05fc44de2448eadad23716e2a4))
