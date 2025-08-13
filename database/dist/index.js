"use strict";
/**
 * Traveller RPG Database Module
 *
 * This module provides the main database client and utility functions
 * for the Traveller RPG application.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = void 0;
var generated_1 = require("./generated");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return generated_1.PrismaClient; } });
__exportStar(require("./client"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./validators"), exports);
__exportStar(require("./utilities"), exports);
__exportStar(require("./seed"), exports);
