import { nextResponse } from "next/server";
export function GET(){

    return nextResponse.json({
        message : "asd"
    })
}