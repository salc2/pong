package controllers

import play.api.libs.concurrent.Akka
import play.api.mvc._
import akka.actor._
import play.api.Play.current
import scala.concurrent.Future
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Source, Flow, Sink}
import akka.stream.scaladsl.{FlowGraph,Broadcast,Merge}
import akka.stream.OverflowStrategy.dropHead
import play.api.libs.json._
import scala.concurrent.ExecutionContext.Implicits.global

class Application extends Controller {

	val game = Akka.system.actorOf(Props[GameActor], name = "game")

		def index = Action { implicit request =>
			Ok(views.html.index())
		}

	def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => wsRef =>
		MyWebSocketActor.props(wsRef, game)
	}

	def joystick = Action { implicit request =>
		Ok(views.html.joystick())
	}

}



object MyWebSocketActor {
	def props(wsRef: ActorRef, gameRef: ActorRef) = 
		Props(new MyWebSocketActor(wsRef,gameRef))
	case class Out(m:Any)
			 case object Subscribe
}
import MyWebSocketActor._
class MyWebSocketActor(wsRef: ActorRef, gameRef: ActorRef) extends 
Actor with ActorLogging {
	override def preStart = gameRef ! Subscribe
		def receive = {
			case Out(m) => wsRef ! m
			case msg: JsValue =>
				  gameRef ! msg
		}
}

class GameActor extends Actor with ActorLogging {
		implicit val system = context.system
		import system.dispatcher
		implicit val materializer = ActorMaterializer()

		var outs = Set[ActorRef]()
		val in = Source.actorRef[JsValue](0, dropHead)
		val out = Sink.foreach[JsValue]{o => tellThem(o)}

		val source = Flow() {implicit b =>
			import FlowGraph.Implicits._
				val bcast = b.add(Broadcast[JsValue](2))
				val print = Sink.foreach[JsValue]{o => println(o.toString) }
				val f1 = Flow[JsValue].filter(v => (v \ "type").asOpt[String].
					getOrElse("").equals("paddles"))

			bcast.out(0) ~> f1 ~> print

			(bcast.in, bcast.out(1))
		}

	val sourceRef = (source.runWith(in,out))._1	
		def receive = {
			case msg: JsValue =>  sourceRef ! msg
			case Subscribe => outs += sender()
		}
	def tellThem(msg:Any): Unit = outs foreach{ _ ! Out(msg)}

}

