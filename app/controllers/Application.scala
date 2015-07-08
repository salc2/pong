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
val ref = Flow[JsValue]
	.to(Sink.foreach(o => println(o.toString)))
	.runWith(streams)
	
  def index = Action { implicit request =>
    Ok(views.html.index("Hello Pong"))
  }

  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => wsActor =>
      MyWebSocketActor.props(wsActor)
  }
	
  def joystick = Action { implicit request =>
  	Ok(views.html.joystick("Joystick"))
  }

}



object MyWebSocketActor {
  def props(wsActor: ActorRef) = Props(new MyWebSocketActor(wsActor))
}

class MyWebSocketActor(wsActor: ActorRef) extends Actor with ActorLogging {
  def receive = {
    case msg: JsValue =>
      log.info(msg.toString)
  }
}

