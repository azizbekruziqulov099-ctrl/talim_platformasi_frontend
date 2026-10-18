// REV151: bog'cha darslari uchun rassom chizgan rasmlar (avtomatik ro'yxat). Kalit — «d_» + darsRasmMeta.js dagi id.
import { RASMLAR } from "./xonalar/rasmlar.js";
import d_apple_please from "./dars/rasm/apple-please.webp";
import d_basket from "./dars/rasm/basket.webp";
import d_bathroom from "./dars/rasm/bathroom.webp";
import d_be_quiet from "./dars/rasm/be-quiet.webp";
import d_bear from "./dars/rasm/bear.webp";
import d_big from "./dars/rasm/big.webp";
import d_black from "./dars/rasm/black.webp";
import d_blue from "./dars/rasm/blue.webp";
import d_brown from "./dars/rasm/brown.webp";
import d_bu_mening_akam_yoki_ukam from "./dars/rasm/bu_mening_akam_yoki_ukam.webp";
import d_bu_mening_dadam from "./dars/rasm/bu_mening_dadam.webp";
import d_bu_mening_onam from "./dars/rasm/bu_mening_onam.webp";
import d_bu_mening_opam_yoki_singlim from "./dars/rasm/bu_mening_opam_yoki_singlim.webp";
import d_can_clap from "./dars/rasm/can-clap.webp";
import d_can_i_help from "./dars/rasm/can-i-help.webp";
import d_can_jump from "./dars/rasm/can-jump.webp";
import d_can_you_swim from "./dars/rasm/can-you-swim.webp";
import d_cant_fly from "./dars/rasm/cant-fly.webp";
import d_clap_your_hands from "./dars/rasm/clap-your-hands.webp";
import d_climb from "./dars/rasm/climb.webp";
import d_close_book from "./dars/rasm/close-book.webp";
import d_crocodile from "./dars/rasm/crocodile.webp";
import d_dislike_onions from "./dars/rasm/dislike-onions.webp";
import d_dislike_rain from "./dars/rasm/dislike-rain.webp";
import d_dislike_spiders from "./dars/rasm/dislike-spiders.webp";
import d_do_you_like from "./dars/rasm/do-you-like.webp";
import d_do_st from "./dars/rasm/do_st.webp";
import d_elephant from "./dars/rasm/elephant.webp";
import d_family from "./dars/rasm/family.webp";
import d_farm from "./dars/rasm/farm.webp";
import d_favourite_colour from "./dars/rasm/favourite-colour.webp";
import d_favourite_plov from "./dars/rasm/favourite-plov.webp";
import d_fish_swim from "./dars/rasm/fish-swim.webp";
import d_five_bananas from "./dars/rasm/five-bananas.webp";
import d_fox from "./dars/rasm/fox.webp";
import d_from_uzbekistan from "./dars/rasm/from-uzbekistan.webp";
import d_futbolkam_qizil from "./dars/rasm/futbolkam_qizil.webp";
import d_garden from "./dars/rasm/garden.webp";
import d_giraffe from "./dars/rasm/giraffe.webp";
import d_go_by_bus from "./dars/rasm/go-by-bus.webp";
import d_goodbye_see_you from "./dars/rasm/goodbye-see-you.webp";
import d_green from "./dars/rasm/green.webp";
import d_grey from "./dars/rasm/grey.webp";
import d_have_ball from "./dars/rasm/have-ball.webp";
import d_have_cat from "./dars/rasm/have-cat.webp";
import d_have_dog from "./dars/rasm/have-dog.webp";
import d_have_sister from "./dars/rasm/have-sister.webp";
import d_he_is_doctor from "./dars/rasm/he-is-doctor.webp";
import d_hello from "./dars/rasm/hello.webp";
import d_help_me from "./dars/rasm/help-me.webp";
import d_here_you_are from "./dars/rasm/here-you-are.webp";
import d_how_are_you from "./dars/rasm/how-are-you.webp";
import d_how_go_school from "./dars/rasm/how-go-school.webp";
import d_how_many from "./dars/rasm/how-many.webp";
import d_how_many_bananas from "./dars/rasm/how-many-bananas.webp";
import d_i_am_big from "./dars/rasm/i-am-big.webp";
import d_i_am_five from "./dars/rasm/i-am-five.webp";
import d_i_like from "./dars/rasm/i-like.webp";
import d_i_walk from "./dars/rasm/i-walk.webp";
import d_im_fine from "./dars/rasm/im-fine.webp";
import d_im_thirsty from "./dars/rasm/im-thirsty.webp";
import d_in_box from "./dars/rasm/in-box.webp";
import d_its_a_ball from "./dars/rasm/its-a-ball.webp";
import d_kitchen from "./dars/rasm/kitchen.webp";
import d_kiy from "./dars/rasm/kiy.webp";
import d_lets_count from "./dars/rasm/lets-count.webp";
import d_lets_play from "./dars/rasm/lets-play.webp";
import d_like_apples from "./dars/rasm/like-apples.webp";
import d_like_cats from "./dars/rasm/like-cats.webp";
import d_like_ice_cream from "./dars/rasm/like-ice-cream.webp";
import d_lion from "./dars/rasm/lion.webp";
import d_living_room from "./dars/rasm/living-room.webp";
import d_love_mum from "./dars/rasm/love-mum.webp";
import d_mening_ismim_anvar from "./dars/rasm/mening_ismim_anvar.webp";
import d_money from "./dars/rasm/money.webp";
import d_monkey from "./dars/rasm/monkey.webp";
import d_my_name_is from "./dars/rasm/my-name-is.webp";
import d_my_name_is_2 from "./dars/rasm/my-name-is_2.webp";
import d_nice_to_meet from "./dars/rasm/nice-to-meet.webp";
import d_no from "./dars/rasm/no.webp";
import d_no_i_cant from "./dars/rasm/no-i-cant.webp";
import d_no_i_dont from "./dars/rasm/no-i-dont.webp";
import d_of_course from "./dars/rasm/of-course.webp";
import d_on_table from "./dars/rasm/on-table.webp";
import d_open_book from "./dars/rasm/open-book.webp";
import d_owl from "./dars/rasm/owl.webp";
import d_pink from "./dars/rasm/pink.webp";
import d_purple from "./dars/rasm/purple.webp";
import d_raise_hand from "./dars/rasm/raise-hand.webp";
import d_red from "./dars/rasm/red.webp";
import d_ride_bike from "./dars/rasm/ride-bike.webp";
import d_school from "./dars/rasm/school.webp";
import d_shapkangni_kiy from "./dars/rasm/shapkangni_kiy.webp";
import d_she_is_teacher from "./dars/rasm/she-is-teacher.webp";
import d_sit_down from "./dars/rasm/sit-down.webp";
import d_skate from "./dars/rasm/skate.webp";
import d_small from "./dars/rasm/small.webp";
import d_snake from "./dars/rasm/snake.webp";
import d_snake_cant_walk from "./dars/rasm/snake-cant-walk.webp";
import d_snowy from "./dars/rasm/snowy.webp";
import d_stamp_your_feet from "./dars/rasm/stamp-your-feet.webp";
import d_stand_up from "./dars/rasm/stand-up.webp";
import d_stop from "./dars/rasm/stop.webp";
import d_thank_you from "./dars/rasm/thank-you.webp";
import d_this_is_my from "./dars/rasm/this-is-my.webp";
import d_tiger from "./dars/rasm/tiger.webp";
import d_today_is from "./dars/rasm/today-is.webp";
import d_tomorrow from "./dars/rasm/tomorrow.webp";
import d_tuflim_ko_k from "./dars/rasm/tuflim_ko_k.webp";
import d_under_bed from "./dars/rasm/under-bed.webp";
import d_want_pilot from "./dars/rasm/want-pilot.webp";
import d_want_to_be from "./dars/rasm/want-to-be.webp";
import d_weather from "./dars/rasm/weather.webp";
import d_week from "./dars/rasm/week.webp";
import d_weekend from "./dars/rasm/weekend.webp";
import d_well_done from "./dars/rasm/well-done.webp";
import d_what_day from "./dars/rasm/what-day.webp";
import d_what_is_it from "./dars/rasm/what-is-it.webp";
import d_what_like from "./dars/rasm/what-like.webp";
import d_whats_your_name from "./dars/rasm/whats-your-name.webp";
import d_where_cat from "./dars/rasm/where-cat.webp";
import d_where_live from "./dars/rasm/where-live.webp";
import d_white from "./dars/rasm/white.webp";
import d_wolf from "./dars/rasm/wolf.webp";
import d_xursand from "./dars/rasm/xursand.webp";
import d_yes from "./dars/rasm/yes.webp";
import d_yes_i_can from "./dars/rasm/yes-i-can.webp";
import d_yes_i_do from "./dars/rasm/yes-i-do.webp";
import d_yummy from "./dars/rasm/yummy.webp";
import d_zebra from "./dars/rasm/zebra.webp";
export const DARS_RASM = {
  "d_apple-please": d_apple_please,
  "d_basket": d_basket,
  "d_bathroom": d_bathroom,
  "d_be-quiet": d_be_quiet,
  "d_bear": d_bear,
  "d_big": d_big,
  "d_black": d_black,
  "d_blue": d_blue,
  "d_brown": d_brown,
  "d_bu_mening_akam_yoki_ukam": d_bu_mening_akam_yoki_ukam,
  "d_bu_mening_dadam": d_bu_mening_dadam,
  "d_bu_mening_onam": d_bu_mening_onam,
  "d_bu_mening_opam_yoki_singlim": d_bu_mening_opam_yoki_singlim,
  "d_can-clap": d_can_clap,
  "d_can-i-help": d_can_i_help,
  "d_can-jump": d_can_jump,
  "d_can-you-swim": d_can_you_swim,
  "d_cant-fly": d_cant_fly,
  "d_clap-your-hands": d_clap_your_hands,
  "d_climb": d_climb,
  "d_close-book": d_close_book,
  "d_crocodile": d_crocodile,
  "d_dislike-onions": d_dislike_onions,
  "d_dislike-rain": d_dislike_rain,
  "d_dislike-spiders": d_dislike_spiders,
  "d_do-you-like": d_do_you_like,
  "d_do_st": d_do_st,
  "d_elephant": d_elephant,
  "d_family": d_family,
  "d_farm": d_farm,
  "d_favourite-colour": d_favourite_colour,
  "d_favourite-plov": d_favourite_plov,
  "d_fish-swim": d_fish_swim,
  "d_five-bananas": d_five_bananas,
  "d_fox": d_fox,
  "d_from-uzbekistan": d_from_uzbekistan,
  "d_futbolkam_qizil": d_futbolkam_qizil,
  "d_garden": d_garden,
  "d_giraffe": d_giraffe,
  "d_go-by-bus": d_go_by_bus,
  "d_goodbye-see-you": d_goodbye_see_you,
  "d_green": d_green,
  "d_grey": d_grey,
  "d_have-ball": d_have_ball,
  "d_have-cat": d_have_cat,
  "d_have-dog": d_have_dog,
  "d_have-sister": d_have_sister,
  "d_he-is-doctor": d_he_is_doctor,
  "d_hello": d_hello,
  "d_help-me": d_help_me,
  "d_here-you-are": d_here_you_are,
  "d_how-are-you": d_how_are_you,
  "d_how-go-school": d_how_go_school,
  "d_how-many": d_how_many,
  "d_how-many-bananas": d_how_many_bananas,
  "d_i-am-big": d_i_am_big,
  "d_i-am-five": d_i_am_five,
  "d_i-like": d_i_like,
  "d_i-walk": d_i_walk,
  "d_im-fine": d_im_fine,
  "d_im-thirsty": d_im_thirsty,
  "d_in-box": d_in_box,
  "d_its-a-ball": d_its_a_ball,
  "d_kitchen": d_kitchen,
  "d_kiy": d_kiy,
  "d_lets-count": d_lets_count,
  "d_lets-play": d_lets_play,
  "d_like-apples": d_like_apples,
  "d_like-cats": d_like_cats,
  "d_like-ice-cream": d_like_ice_cream,
  "d_lion": d_lion,
  "d_living-room": d_living_room,
  "d_love-mum": d_love_mum,
  "d_mening_ismim_anvar": d_mening_ismim_anvar,
  "d_money": d_money,
  "d_monkey": d_monkey,
  "d_my-name-is": d_my_name_is,
  "d_my-name-is_2": d_my_name_is_2,
  "d_nice-to-meet": d_nice_to_meet,
  "d_no": d_no,
  "d_no-i-cant": d_no_i_cant,
  "d_no-i-dont": d_no_i_dont,
  "d_of-course": d_of_course,
  "d_on-table": d_on_table,
  "d_open-book": d_open_book,
  "d_owl": d_owl,
  "d_pink": d_pink,
  "d_purple": d_purple,
  "d_raise-hand": d_raise_hand,
  "d_red": d_red,
  "d_ride-bike": d_ride_bike,
  "d_school": d_school,
  "d_shapkangni_kiy": d_shapkangni_kiy,
  "d_she-is-teacher": d_she_is_teacher,
  "d_sit-down": d_sit_down,
  "d_skate": d_skate,
  "d_small": d_small,
  "d_snake": d_snake,
  "d_snake-cant-walk": d_snake_cant_walk,
  "d_snowy": d_snowy,
  "d_stamp-your-feet": d_stamp_your_feet,
  "d_stand-up": d_stand_up,
  "d_stop": d_stop,
  "d_thank-you": d_thank_you,
  "d_this-is-my": d_this_is_my,
  "d_tiger": d_tiger,
  "d_today-is": d_today_is,
  "d_tomorrow": d_tomorrow,
  "d_tuflim_ko_k": d_tuflim_ko_k,
  "d_under-bed": d_under_bed,
  "d_want-pilot": d_want_pilot,
  "d_want-to-be": d_want_to_be,
  "d_weather": d_weather,
  "d_week": d_week,
  "d_weekend": d_weekend,
  "d_well-done": d_well_done,
  "d_what-day": d_what_day,
  "d_what-is-it": d_what_is_it,
  "d_what-like": d_what_like,
  "d_whats-your-name": d_whats_your_name,
  "d_where-cat": d_where_cat,
  "d_where-live": d_where_live,
  "d_white": d_white,
  "d_wolf": d_wolf,
  "d_xursand": d_xursand,
  "d_yes": d_yes,
  "d_yes-i-can": d_yes_i_can,
  "d_yes-i-do": d_yes_i_do,
  "d_yummy": d_yummy,
  "d_zebra": d_zebra,
};
/** Xonalar va darslar rasmlari birga — emoji/so'z bo'yicha topilgan id shu yerdan olinadi. */
export const RASM_HAMMA = { ...RASMLAR, ...DARS_RASM };
