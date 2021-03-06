## [v1.6.4](https://github.com/adrai/node-cqrs-saga/compare/v1.6.3...v1.6.4)
- expose warnings during initialization

## [v1.6.3](https://github.com/adrai/node-cqrs-saga/compare/v1.6.2...v1.6.3)
- better catch for userland errors

## [v1.6.2](https://github.com/adrai/node-cqrs-saga/compare/v1.6.1...v1.6.2)
- fix alreadyInQueue check

## [v1.6.1](https://github.com/adrai/node-cqrs-saga/compare/v1.6.0...v1.6.1)
- redis: replace .keys() calls with .scan() calls => scales better

## [v1.6.0](https://github.com/adrai/node-cqrs-saga/compare/v1.5.0...v1.6.0)
- introduce possibility to define a shouldHandle function

## [v1.5.0](https://github.com/adrai/node-cqrs-saga/compare/v1.4.0...v1.5.0)
- when using revisionGuard, always save the last event
- when using revisionGuard, added possibility to fetch the last handled event

## [v1.4.0](https://github.com/adrai/node-cqrs-saga/compare/v1.3.0...v1.4.0)
- add retry mechanism for saga

## [v1.3.0](https://github.com/adrai/node-cqrs-saga/compare/v1.2.9...v1.3.0)
- fix revisionGuard when handling duplicate events at the same time

## [v1.2.9](https://github.com/adrai/node-cqrs-saga/compare/v1.2.8...v1.2.9)
- fixed mongodb indexes

## [v1.2.8](https://github.com/adrai/node-cqrs-saga/compare/v1.2.7...v1.2.8)
- added mongodb driver 2.x support

## [v1.2.7](https://github.com/adrai/node-cqrs-saga/compare/v1.2.4...v1.2.7)
- optimize structureParser

## [v1.2.4](https://github.com/adrai/node-cqrs-saga/compare/v1.2.3...v1.2.4)
- added convenience information on sagaModel (actionOnCommit)

## [v1.2.3](https://github.com/adrai/node-cqrs-saga/compare/v1.2.1...v1.2.3)
- fix usage with own db implementation

## [v1.2.1](https://github.com/adrai/node-cqrs-saga/compare/v1.2.0...v1.2.1)
- generate command id if not set even if destroying the saga

## [v1.2.0](https://github.com/adrai/node-cqrs-saga/compare/v1.1.3...v1.2.0)
- added getInfo function

## [v1.1.3](https://github.com/adrai/node-cqrs-saga/compare/v1.1.2...v1.1.3)
- added commitstamp to getUndispatchedcommands
- added possibility to addCommandToSend for timeoutedSagas

## [v1.1.2](https://github.com/adrai/node-cqrs-saga/compare/v1.1.1...v1.1.2)
- handle case of same aggregateId in different contexts or aggregates

## [v1.1.1](https://github.com/adrai/node-cqrs-saga/compare/v1.1.0...v1.1.1)
- added azure-table support [#2](https://github.com/adrai/node-cqrs-saga/pull/#2) thanks to [sbiaudet](https://github.com/sbiaudet) and [rvin100](https://github.com/rvin100)

## [v1.1.0](https://github.com/adrai/node-cqrs-saga/compare/v1.0.2...v1.1.0)
- introduce revisionGuard

## v1.0.2
- saga: optional define a function to that returns an id that will be used as saga id

## v1.0.1
- make redis commit transactional

## v1.0.0
- first stable release
