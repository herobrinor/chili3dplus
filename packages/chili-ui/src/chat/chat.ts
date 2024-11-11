// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import { PubSub } from "chili-core";
import OpenAI from "openai";
import { div, localize, span, svg, textarea } from "../components";
import style from "./chat.module.css";

export class Chat extends HTMLElement {
    private _isExpanded = false;
    private readonly chatwindow = div({ className: style.chatwindow });
    private chatinput = textarea({
        className: style.inputtext,
        placeholder: "Type your message...",
        rows: 1,
        onkeyup: (e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                let input = e.target as HTMLInputElement;
                PubSub.default.pub("sendChat", input.value);
                this.clearChat();
            }
        },
    });

    constructor(className: string) {
        super();
        this.className = `${style.root} ${style.hidden} ${className}`;
        this.classList.add(style.root);
        PubSub.default.sub("displayChat", () => this._handleExpanderClick());
        this.append(
            div(
                { className: style.headerPanel },
                span({
                    className: style.header,
                    textContent: localize("chat.header"),
                }),
            ),
            div(
                {
                    className: style.chatroom,
                },
                this.chatwindow,
                div(
                    {
                        className: style.inputwindow,
                    },
                    this.chatinput,
                    div(
                        {
                            className: style.button,
                            onclick: () => {
                                PubSub.default.pub("sendChat", this.chatinput.value);
                                this.clearChat();
                            },
                        },
                        svg({
                            title: "Send",
                            className: style.icon,
                            icon: "icon-send",
                        }),
                    ),
                    div(
                        {
                            className: style.button,
                            onclick: () => {
                                this.clearChat();
                            },
                        },
                        svg({
                            title: "Clear",
                            className: style.icon,
                            icon: "icon-clear",
                        }),
                    ),
                ),
            ),
        );
        PubSub.default.sub("sendChat", this.sendChat);
    }

    private clearChat = () => {
        this.chatinput.value = "";
    };

    private sendChat = async (messages: string) => {
        this.chatwindow.append(
            div(
                { className: style.userbubblebox },
                svg({
                    title: "Chat",
                    className: style.icon,
                    icon: "icon-user",
                }),
                div({
                    textContent: messages,
                    className: style.bubble,
                }),
            ),
        );

        this.chatwindow.append(
            div(
                { className: style.botbubblebox },
                svg({
                    title: "Chat",
                    className: style.icon,
                    icon: "icon-bot",
                }),
                div({
                    textContent: "",
                    className: style.bubble,
                }),
            ),
        );

        try {
            // 格式化 messages 以符合 OpenAI API 要求
            const systemPromptCN =
                "你是一名航空领域专家级知识助手“飞知”，尤其擅长民用飞机的设计研发和制造。如果问到相关知识，请从你的专业知识给予专业解答。";
            const temperature = 0.2;
            const apiMessages = [
                { role: "system", content: systemPromptCN },
                { role: "user", content: messages },
            ];

            const openai = new OpenAI({
                organization: "org-MWZfHih7lTBQv4xgPNLPz8lT",
                project: "proj_CfuEEMeP4JScPPPfwLiHcUFP",
                dangerouslyAllowBrowser: true,
            });

            const stream = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPromptCN },
                    { role: "user", content: messages },
                ],
                temperature: temperature,
                stream: true,
            });

            for await (const chunk of stream) {
                this.appendBotMessage(chunk.choices[0]?.delta?.content || "");
            }
        } catch (error) {
            console.error("Error fetching bot response:", error);
            this.appendBotMessage("Sorry, I am having trouble responding right now. Error is: " + error);
        } finally {
        }
    };

    private appendBotMessage(text: string) {
        console.log("streaming!!!");
        this.chatwindow.lastElementChild!.lastElementChild!.textContent += text;
    }

    private _handleExpanderClick = () => {
        this._isExpanded = !this._isExpanded;
        if (this._isExpanded) {
            this.classList.remove(style.hidden);
        } else {
            this.classList.add(style.hidden);
        }
    };
}

customElements.define("chili-chat", Chat);
