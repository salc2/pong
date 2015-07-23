package messages

import play.api.libs.json._

import play.api.mvc.WebSocket.FrameFormatter


object WebSocketMessage {
implicit val ballFormat = Json.format[Ball]
implicit val paddleFormat = Json.format[Paddle]
implicit val inMessageFormat = Json.format[InMessage]
implicit val ouMessageFormat = Json.format[OutMessage]
implicit val inMessageFrameFormatter = FrameFormatter.jsonFrame[InMessage]
implicit val outMessageFrameFormatter = FrameFormatter.jsonFrame[OutMessage]

sealed trait Message
case class InMessage(typee:String, side:String, posy:Double) extends Message
case class OutMessage(ball:Ball, lPaddle:Paddle,rPaddle:Paddle) extends Message
case class Ball(var x:Double,var y:Double,var spdx:Double,var spdy:Double, w:Double,h:Double)
case class Paddle(var x:Double,var y:Double,w:Double,h:Double)
}
