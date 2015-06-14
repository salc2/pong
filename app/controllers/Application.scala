package controllers

import play.api.libs.concurrent.Akka
import play.api.mvc._
import akka.actor._
import play.api.Play.current
import scala.concurrent.Future

class Application extends Controller {
  val USER = "user";
  var counter = 0;

  def index = Action { implicit request =>
    val uid: String = request.session.get(USER).getOrElse {
      counter += 1
      counter.toString
    }
    Ok(views.html.index("Hello Pong")).withSession(request.session + (USER -> counter.toString))
  }

  def socket = WebSocket.tryAcceptWithActor[String, String] { request =>
    Future.successful(request.session.get("user") match {
      case None => Left(Forbidden)
      case Some(_) => Right(MyWebSocketActor.props)
    })
  }
}

object MyWebSocketActor {
  def props(out: ActorRef) = Props(new MyWebSocketActor(out))
}

class MyWebSocketActor(out: ActorRef) extends Actor with ActorLogging {
  override def preStart = {
    log.info("yeah starting")
  }
  def receive = {
    case msg: String =>
      log.info(msg)
      out ! ("I received your message: " + msg)
  }
}

