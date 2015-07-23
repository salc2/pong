package actors 

import akka.actor._
import messages.WebSocketMessage._


object WebSocketActor {
	def props(wsRef: ActorRef, gameRef: ActorRef) = 
		Props(new WebSocketActor(wsRef,gameRef))
	case class Out(msg:Any)
			   case object Subscribe
}

import WebSocketActor._
class WebSocketActor(wsRef: ActorRef, gameRef: ActorRef) extends 
Actor with ActorLogging {
	override def preStart = gameRef ! Subscribe
		def receive = {
			case m:OutMessage => wsRef ! m
			case msg:InMessage => gameRef ! msg
		}
}
