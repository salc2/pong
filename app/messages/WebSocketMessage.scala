package messages

import play.api.libs.json._
import actors.GameActor._
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
object InToOutMessage{
	def apply(i:InMessage, o:OutMessage):OutMessage = {
		i.side match {
			case "lpaddle" => o.copy(lPaddle=o.lPaddle.copy(y=i.posy))
			case "rpaddle" => o.copy(rPaddle=o.rPaddle.copy(y=i.posy))
			case         _ => o
		}
	}
}
}
