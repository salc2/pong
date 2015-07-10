package controllers

import play.api.libs.concurrent.Akka
import play.api.mvc._
import akka.actor._
import play.api.Play.current
import scala.concurrent.Future
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Source, Flow, Sink}
import akka.stream.OverflowStrategy.dropHead
import play.api.libs.json._

class Application extends Controller {
  
implicit val system = Akka.system
import system.dispatcher
implicit val materializer = ActorMaterializer()
val streams = Source.actorRef[JsValue](0, dropHead)

val sink = system.actorOf(Props[SinkActor], name = "sink")

val srcRef = Flow[JsValue]
	.to(Sink.actorRef(sink,"Completed"))
	.runWith(streams)
	
  def index = Action { implicit request =>
    Ok(views.html.index("Hello Pong"))
  }

  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => wsRef =>
      MyWebSocketActor.props(wsRef, srcRef, sink)
  }
	
  def joystick = Action { implicit request =>
  	Ok(views.html.joystick("Joystick"))
  }

}



object MyWebSocketActor {
  def props(wsRef: ActorRef, srcRef: ActorRef, sinkRef: ActorRef) = 
	Props(new MyWebSocketActor(wsRef,srcRef,sinkRef))
	case class Out(m:JsValue)
	case object Subscribe
}
import MyWebSocketActor._
class MyWebSocketActor(wsRef: ActorRef, srcRef: ActorRef, sinkRef: ActorRef) extends 
	Actor with ActorLogging {
  override def preStart = sinkRef ! Subscribe
  def receive = {
    case Out(m) => wsRef ! m
    case msg: JsValue =>
      srcRef ! msg
  }
}

class SinkActor extends Actor with ActorLogging {
	var outs = Set[ActorRef]()
	def receive = {
		case msg: JsValue =>  outs foreach{ _ ! Out(msg)}
		case Subscribe => outs += sender()
	}
}

